import { BaseContext } from '../setup-context';
import { registerDeprecationHandler } from '@ember/debug';
import isPromise from './is-promise';

export interface DeprecationOptions {
  id: string;
  until: string;
  for?: string;
  since?: {
    available: string;
  };
}

export interface DeprecationFailure {
  message: string;
  options: DeprecationOptions;
}

const DEPRECATIONS = new WeakMap<BaseContext, Array<DeprecationFailure>>();

/**
 *
 * Provides the list of deprecation failures associated with a given base context;
 *
 * @private
 * @param {BaseContext} [context] the test context
 * @return {Array<DeprecationFailure>} the Deprecation Failures associated with the corresponding BaseContext;
 */
export function getDeprecationsForContext(
  context: BaseContext
): Array<DeprecationFailure> {
  if (!context) {
    throw new TypeError(
      `[@ember/test-helpers] could not get deprecations for an invalid test context: '${context}'`
    );
  }

  let deprecations = DEPRECATIONS.get(context);

  if (!Array.isArray(deprecations)) {
    deprecations = [];
    DEPRECATIONS.set(context, deprecations);
  }

  return deprecations;
}

/**
 *
 * Provides the list of deprecation failures associated with a given base
 * context which occure while a callback is executed. This callback can be
 * synchonous, or it can be an async function.
 *
 * @private
 * @param {BaseContext} [context] the test context
 * @param {CallableFunction} [callback] The callback that when executed will have its DeprecationFailure recorded
 * @return {Array<DeprecationFailure>} The Deprecation Failures associated with the corresponding baseContext which occured while the CallbackFunction was executed
 */
export function getDeprecationsDuringCallbackForContext(
  context: BaseContext,
  callback: CallableFunction
): Array<DeprecationFailure> | Promise<Array<DeprecationFailure>> {
  if (!context) {
    throw new TypeError(
      `[@ember/test-helpers] could not get deprecations for an invalid test context: '${context}'`
    );
  }

  const deprecations = getDeprecationsForContext(context);
  const previousLength = deprecations.length;

  const result = callback();

  if (isPromise(result)) {
    return Promise.resolve(result).then(() => {
      return deprecations.slice(previousLength); // only return deprecations created as a result of the callback
    });
  } else {
    return deprecations.slice(previousLength); // only return deprecations created as a result of the callback
  }
}

// This provides (when the environment supports) queryParam support for deprecations:
// * squelch deprecations by name via: `/tests/index.html?disabledDeprecations=this-property-fallback,some-other-thing`
// * enable a debuggger when a deprecation by a specific name is encountered via: `/tests/index.html?debugDeprecations=some-other-thing` when the
if (typeof URLSearchParams !== 'undefined') {
  let queryParams = new URLSearchParams(document.location.search.substring(1));
  const disabledDeprecations = queryParams.get('disabledDeprecations');
  const debugDeprecations = queryParams.get('debugDeprecations');

  // When using `/tests/index.html?disabledDeprecations=this-property-fallback,some-other-thing`
  // those deprecations will be squelched
  if (disabledDeprecations) {
    registerDeprecationHandler((message, options, next) => {
      if (!disabledDeprecations.includes(options.id)) {
        // @ts-expect-error https://github.com/DefinitelyTyped/DefinitelyTyped/pull/59014
        next.apply(null, [message, options]);
      }
    });
  }

  // When using `/tests/index.html?debugDeprecations=some-other-thing` when the
  // `some-other-thing` deprecation is triggered, this `debugger` will be hit`
  if (debugDeprecations) {
    registerDeprecationHandler((message, options, next) => {
      if (debugDeprecations.includes(options.id)) {
        debugger; // eslint-disable-line no-debugger
      }

      // @ts-expect-error https://github.com/DefinitelyTyped/DefinitelyTyped/pull/59014
      next.apply(null, [message, options]);
    });
  }
}
