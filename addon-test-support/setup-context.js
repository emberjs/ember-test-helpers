import { run } from '@ember/runloop';
import { set, setProperties, get, getProperties } from '@ember/object';
import buildOwner from './build-owner';
import { _setupPromiseListeners } from './ext/rsvp';
import { _setupAJAXHooks } from './wait';

/*
 * Responsible for:
 *
 * * create an owner object and set it on the provided context (e.g. this.owner)
 * * setup this.set, this.setProperties, this.get, and this.getProperties to the provided context
 * * setting up AJAX listeners
 * * setting up RSVP promise integration
 */
export default function(context, options = {}) {
  let resolver = options.resolver;
  let owner = buildOwner(resolver);

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

  _setupAJAXHooks();
  _setupPromiseListeners();
}
