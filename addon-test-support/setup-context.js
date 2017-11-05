import { run, next } from '@ember/runloop';
import { set, setProperties, get, getProperties } from '@ember/object';
import buildOwner from './build-owner';
import { _setupPromiseListeners } from './ext/rsvp';
import { _setupAJAXHooks } from './settled';
import Ember from 'ember';
import { Promise } from 'rsvp';
import { assert } from '@ember/debug';
import global from './global';
import { getResolver } from './resolver';
import { getApplication } from './application';

let __test_context__;

export function setContext(context) {
  __test_context__ = context;
}

export function getContext() {
  return __test_context__;
}

export function unsetContext() {
  __test_context__ = undefined;
}

export function pauseTest() {
  let context = getContext();

  if (!context || typeof context.pauseTest !== 'function') {
    throw new Error(
      'Cannot call `pauseTest` without having first called `setupTest` or `setupRenderingTest`.'
    );
  }

  return context.pauseTest();
}

export function resumeTest() {
  let context = getContext();

  if (!context || typeof context.resumeTest !== 'function') {
    throw new Error(
      'Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.'
    );
  }

  return context.resumeTest();
}

/*
 * Responsible for:
 *
 * - sets the "global testing context" to the provided context
 * - create an owner object and set it on the provided context (e.g. this.owner)
 * - setup this.set, this.setProperties, this.get, and this.getProperties to the provided context
 * - setting up AJAX listeners
 * - setting up RSVP promise integration
 */
export default function(context, options = {}) {
  Ember.testing = true;
  setContext(context);

  return new Promise(resolve => {
    // ensure "real" async and not "fake" RSVP based async
    next(resolve);
  })
    .then(() => {
      let { resolver } = options;
      let buildOwnerOptions;

      // This handles precendence, specifying a specific option of
      // resolver always trumps whatever is auto-detected, then we fallback to
      // the suite-wide registrations
      //
      // At some later time this can be extended to support specifying a custom
      // engine or application...
      if (resolver) {
        buildOwnerOptions = { resolver };
      } else {
        buildOwnerOptions = {
          resolver: getResolver(),
          application: getApplication(),
        };
      }

      return buildOwner(buildOwnerOptions);
    })
    .then(owner => {
      context.owner = owner;

      context.set = function(key, value) {
        let ret = run(function() {
          return set(context, key, value);
        });

        return ret;
      };

      context.setProperties = function(hash) {
        let ret = run(function() {
          return setProperties(context, hash);
        });

        return ret;
      };

      context.get = function(key) {
        return get(context, key);
      };

      context.getProperties = function(...args) {
        return getProperties(context, args);
      };

      let resume;
      context.resumeTest = function resumeTest() {
        assert('Testing has not been paused. There is nothing to resume.', resume);
        resume();
        global.resumeTest = resume = undefined;
      };

      context.pauseTest = function pauseTest() {
        console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

        return new Promise(resolve => {
          resume = resolve;
          global.resumeTest = resumeTest;
        }, 'TestAdapter paused promise');
      };

      _setupAJAXHooks();
      _setupPromiseListeners();

      return context;
    });
}
