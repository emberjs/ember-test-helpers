import { registerWarnHandler } from '@ember/debug';
import isPromise from './is-promise.js';

// the WARNINGS data structure which is used to weakly associated warnings with
// the test context their occurred within
const WARNINGS = new WeakMap();

/**
 *
 * Provides the list of warnings associated with a given base context;
 *
 * @private
 * @param {BaseContext} [context] the test context
 * @return {Array<Warning>} the warnings associated with the corresponding BaseContext;
 */
function getWarningsForContext(context) {
  if (!context) {
    throw new TypeError(`[@ember/test-helpers] could not get warnings for an invalid test context: '${context}'`);
  }
  let warnings = WARNINGS.get(context);
  if (!Array.isArray(warnings)) {
    warnings = [];
    WARNINGS.set(context, warnings);
  }
  return warnings;
}

/**
 *
 * Provides the list of warnings associated with a given test context which
 * occurred only while a the provided callback is executed. This callback can be
 * synchronous, or it can be an async function.
 *
 * @private
 * @param {BaseContext} [context] the test context
 * @param {Function} [callback] The callback that when executed will have its warnings recorded
 * @return {Array<Warning>} The warnings associated with the corresponding baseContext which occurred while the CallbackFunction was executed
 */
function getWarningsDuringCallbackForContext(context, callback) {
  if (!context) {
    throw new TypeError(`[@ember/test-helpers] could not get warnings for an invalid test context: '${context}'`);
  }
  const warnings = getWarningsForContext(context);
  const previousLength = warnings.length;
  const result = callback();
  if (isPromise(result)) {
    return Promise.resolve(result).then(() => {
      return warnings.slice(previousLength); // only return warnings created as a result of the callback
    });
  } else {
    return warnings.slice(previousLength); // only return warnings created as a result of the callback
  }
}

// This provides (when the environment supports) queryParam support for warnings:
// * squelch warnings by name via: `/tests/index.html?disabledWarnings=this-property-fallback,some-other-thing`
// * enable a debuggger when a warning by a specific name is encountered via: `/tests/index.html?debugWarnings=some-other-thing` when the
if (typeof URLSearchParams !== 'undefined') {
  const queryParams = new URLSearchParams(document.location.search.substring(1));
  const disabledWarnings = queryParams.get('disabledWarnings');
  const debugWarnings = queryParams.get('debugWarnings');

  // When using `/tests/index.html?disabledWarnings=this-property-fallback,some-other-thing`
  // those warnings will be squelched
  if (disabledWarnings) {
    registerWarnHandler((message, options, next) => {
      if (!options || !disabledWarnings.includes(options.id)) {
        next.apply(null, [message, options]);
      }
    });
  }

  // When using `/tests/index.html?debugWarnings=some-other-thing` when the
  // `some-other-thing` warning is triggered, this `debugger` will be hit`
  if (debugWarnings) {
    registerWarnHandler((message, options, next) => {
      if (options && debugWarnings.includes(options.id)) {
        debugger; // eslint-disable-line no-debugger
      }
      next.apply(null, [message, options]);
    });
  }
}

export { getWarningsDuringCallbackForContext, getWarningsForContext };
//# sourceMappingURL=warnings.js.map
