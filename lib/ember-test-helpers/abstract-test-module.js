import { _setupAJAXHooks, _teardownAJAXHooks } from './wait';
import { getContext, setContext, unsetContext } from './test-context';

import Ember from 'ember';

// calling this `merge` here because we cannot
// actually assume it is like `Object.assign`
// with > 2 args
const merge = Ember.assign || Ember.merge;

export default class {
  constructor(name, options) {
    this.context = undefined;
    this.name = name;
    this.callbacks = options || {};

    this.initSetupSteps();
    this.initTeardownSteps();
  }

  setup(assert) {
    return this.invokeSteps(this.setupSteps, this, assert).then(() => {
      this.contextualizeCallbacks();
      return this.invokeSteps(this.contextualizedSetupSteps, this.context, assert);
    });
  }

  teardown(assert) {
    return this.invokeSteps(this.contextualizedTeardownSteps, this.context, assert).then(() => {
      return this.invokeSteps(this.teardownSteps, this, assert);
    }).then(() => {
      this.cache = null;
      this.cachedCalls = null;
    });
  }

  initSetupSteps() {
    this.setupSteps = [];
    this.contextualizedSetupSteps = [];

    if (this.callbacks.beforeSetup) {
      this.setupSteps.push( this.callbacks.beforeSetup );
      delete this.callbacks.beforeSetup;
    }

    this.setupSteps.push(this.setupContext);
    this.setupSteps.push(this.setupTestElements);
    this.setupSteps.push(this.setupAJAXListeners);

    if (this.callbacks.setup) {
      this.contextualizedSetupSteps.push( this.callbacks.setup );
      delete this.callbacks.setup;
    }
  }

  invokeSteps(steps, context, assert) {
    steps = steps.slice();

    function nextStep() {
      var step = steps.shift();
      if (step) {
        // guard against exceptions, for example missing components referenced from needs.
        return new Ember.RSVP.Promise((resolve) => {
          resolve(step.call(context, assert));
        }).then(nextStep);
      } else {
        return Ember.RSVP.resolve();
      }
    }
    return nextStep();
  }

  contextualizeCallbacks() {

  }

  initTeardownSteps() {
    this.teardownSteps = [];
    this.contextualizedTeardownSteps = [];

    if (this.callbacks.teardown) {
      this.contextualizedTeardownSteps.push( this.callbacks.teardown );
      delete this.callbacks.teardown;
    }

    this.teardownSteps.push(this.teardownContext);
    this.teardownSteps.push(this.teardownTestElements);
    this.teardownSteps.push(this.teardownAJAXListeners);

    if (this.callbacks.afterTeardown) {
      this.teardownSteps.push( this.callbacks.afterTeardown );
      delete this.callbacks.afterTeardown;
    }
  }

  setupTestElements() {
    let testEl = document.querySelector('#ember-testing');
    if (!testEl) {
      let element = document.createElement('div');
      element.setAttribute('id', 'ember-testing');

      document.body.appendChild(element);
      this.fixtureResetValue = '';
    } else {
      this.fixtureResetValue = testEl.innerHTML;
    }
  }

  setupContext(options) {
    let context = this.getContext();

    merge(context, {
      dispatcher: null,
      inject: {}
    });
    merge(context, options);

    this.setToString();
    setContext(context);
    this.context = context;
  }

  setContext(context) {
    this.context = context;
  }

  getContext() {
    if (this.context) { return this.context; }

    return this.context = getContext() || {};
  }

  setToString() {
    this.context.toString = () =>  {
      if(this.subjectName) {
        return `test context for: ${this.subjectName}`;
      }

      if(this.name) {
        return `test context for: ${this.name}`;
      }
    };
  }

  setupAJAXListeners() {
    _setupAJAXHooks();
  }

  teardownAJAXListeners() {
    _teardownAJAXHooks();
  }

  teardownTestElements() {
    document.getElementById('ember-testing').innerHTML = this.fixtureResetValue;

    // Ember 2.0.0 removed Ember.View as public API, so only do this when
    // Ember.View is present
    if (Ember.View && Ember.View.views) {
      Ember.View.views = {};
    }
  }

  teardownContext() {
    var context = this.context;
    this.context = undefined;
    unsetContext();

    if (context && context.dispatcher && !context.dispatcher.isDestroyed) {
      Ember.run(function() {
        context.dispatcher.destroy();
      });
    }
  }
}
