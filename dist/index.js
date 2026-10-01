import { _ as _cleanupOnerror, a as _teardownAJAXHooks, u as unsetContext, s as settled, g as getContext, i as isTestContext, b as isElement, c as isDocument, r as runHooks, d as isWindow, e as registerHook, f as isFormControl, h as isContentEditable, j as isVisible, k as isDisabled, l as isNumeric, w as waitUntil } from './setup-context-BwSdAogx.js';
export { m as currentRouteName, n as currentURL, o as getApplication, p as getDeprecations, q as getDeprecationsDuringCallback, t as getResolver, v as getSettledState, x as getWarnings, y as getWarningsDuringCallback, z as isSettled, A as pauseTest, B as resetOnerror, C as resumeTest, D as setApplication, E as setContext, F as setResolver, G as setupApplicationContext, H as setupContext, I as setupOnerror, J as visit } from './setup-context-BwSdAogx.js';
export { default as hasEmberVersion } from './has-ember-version.js';
import { setTesting, isTesting } from '@ember/debug';
import { destroy } from '@ember/destroyable';
import { run, schedule } from '@ember/runloop';
import { EventDispatcher } from '@ember/-internals/views';
import getTestMetadata from './test-metadata.js';
import { getInternalComponentManager } from '@glimmer/manager';
import { macroCondition, appEmberSatisfies, importSync, dependencySatisfies } from '@embroider/macros';
import { precompileTemplate } from '@ember/template-compilation';
import { capabilities, setComponentManager, setComponentTemplate } from '@ember/component';
import { getOnerror } from '@ember/-internals/error-handling';
export { getDebugInfo } from './-internal/debug-info.js';
export { default as registerDebugInfoHelper } from './-internal/debug-info-helpers.js';
import { lookupDescriptorData, resolveDOMElement, isDescriptor, resolveDOMElements } from 'dom-element-descriptors';
import { log } from './dom/-logging.js';

/**
  Used by test framework addons to tear down the provided context after testing is completed.

  Responsible for:

  - un-setting the "global testing context" (`unsetContext`)
  - destroy the contexts owner object
  - remove AJAX listeners

  @public
  @param {Object} context the context to setup
  @param {Object} [options] options used to override defaults
  @param {boolean} [options.waitForSettled=true] should the teardown wait for `settled()`ness
  @returns {Promise<void>} resolves when settled
*/
function teardownContext(context, {
  waitForSettled = true
} = {}) {
  return Promise.resolve().then(() => {
    _cleanupOnerror(context);
    _teardownAJAXHooks();
    setTesting(false);
    unsetContext();
    destroy(context.owner);
  }).finally(() => {
    if (waitForSettled) {
      return settled();
    }
    return;
  });
}

/**
  Get the root element of the application under test (usually `#ember-testing`)

  @public
  @returns {Element} the root element

  @example
  <caption>
    Getting the root element of the application and checking that it is equal
    to the element with id 'ember-testing'.
  </caption>
  assert.equal(getRootElement(), document.querySelector('#ember-testing'));
*/
function getRootElement() {
  const context = getContext();
  if (!context || !isTestContext(context) || !context.owner) {
    throw new Error('Must setup rendering context before attempting to interact with elements.');
  }
  const owner = context.owner;
  let rootElement;
  // When the host app uses `setApplication` (instead of `setResolver`) the owner has
  // a `rootElement` set on it with the element or id to be used
  if (owner && owner._emberTestHelpersMockOwner === undefined) {
    rootElement = owner.rootElement;
  } else {
    rootElement = '#ember-testing';
  }
  if (rootElement instanceof Window) {
    rootElement = rootElement.document;
  }
  if (isElement(rootElement) || isDocument(rootElement)) {
    return rootElement;
  } else if (typeof rootElement === 'string') {
    const _rootElement = document.querySelector(rootElement);
    if (_rootElement) {
      return _rootElement;
    }
    throw new Error(`Application.rootElement (${rootElement}) not found`);
  } else {
    throw new Error('Application.rootElement must be an element or a selector string');
  }
}

// @ts-ignore: types for this API is not consistently available (via transitive
// deps) and we do not currently want to make it an explicit dependency. It
// does, however, consistently work at runtime. :sigh:

/**
 * We should ultimately get a new API from @glimmer/runtime that provides this functionality
 * (see https://github.com/emberjs/rfcs/pull/785 for more info).
 * @private
 * @param {Object} maybeComponent The thing you think might be a component
 * @returns {boolean} True if it's a component, false if not
 */
function isComponent(maybeComponent) {
  return !!getInternalComponentManager(maybeComponent, true);
}

let renderComponent;

/**
 * while renderComponent landed in ember-source @ 6.8.0-alpha.1,
 *  it was not fully usable (in serious) until 6.12.0-alpha.4
 *  when https://github.com/emberjs/ember.js/pull/20996 was merged.
 *
 * ... but even then, we still needed a debugRenderTree fix,
 *     which didn't land until 6.12.1.
 *  https://github.com/emberjs/ember.js/pull/21623
 */
if (macroCondition(appEmberSatisfies('>=6.12.1'))) {
  renderComponent = importSync('@ember/renderer').renderComponent;
}
var renderComponent$1 = renderComponent;

const OUTLET_TEMPLATE = precompileTemplate("{{outlet}}", {
  strictMode: false
});
const EMPTY_TEMPLATE = precompileTemplate("", {
  strictMode: false
});
const INVOKE_PROVIDED_COMPONENT = precompileTemplate("<this.ProvidedComponent />", {
  strictMode: false
});
const hasCalledSetupRenderingContext = Symbol();
//  Isolates the notion of transforming a TextContext into a RenderingTestContext.
// eslint-disable-next-line require-jsdoc
function prepare(context) {
  context[hasCalledSetupRenderingContext] = true;
  return context;
}

// eslint-disable-next-line require-jsdoc
function isRenderingTestContext(context) {
  return isTestContext(context) && hasCalledSetupRenderingContext in context;
}
function supportsRenderRootComponent(owner) {
  return typeof owner.renderRootComponent === 'function';
}

/**
  @private
  @param {Ember.ApplicationInstance} owner the current owner instance
  @param {string} templateFullName the fill template name
  @returns {Template} the template representing `templateFullName`
*/
function lookupTemplate(owner, templateFullName) {
  const template = owner.lookup(templateFullName);
  if (typeof template === 'function') return template(owner);
  return template;
}

/**
  @private
  @param {Ember.ApplicationInstance} owner the current owner instance
  @returns {Template} a template representing {{outlet}}
*/
function lookupOutletTemplate(owner) {
  let OutletTemplate = lookupTemplate(owner, 'template:-outlet');
  if (!OutletTemplate) {
    owner.register('template:-outlet', OUTLET_TEMPLATE);
    OutletTemplate = lookupTemplate(owner, 'template:-outlet');
  }
  return OutletTemplate;
}
let templateId = 0;
const RENDER_CONTEXT_CAPABILITIES = capabilities('3.13', {
  destructor: false,
  asyncLifecycleCallbacks: false
});
// Provides the `this` for `render(hbs`{{this.foo}}`)
const renderContextManager = {
  capabilities: RENDER_CONTEXT_CAPABILITIES,
  createComponent(definition) {
    return definition.context;
  },
  getContext(context) {
    return context;
  }
};
function contextComponentFor(templateFactoryOrComponent, context) {
  const definition = {
    context
  };
  setComponentManager(() => renderContextManager, definition);
  setComponentTemplate(templateFactoryOrComponent, definition);
  return definition;
}

/**
  Render `component` into the testing root element using the `renderComponent`
*/
function renderViaRenderComponent(owner, context, templateFactoryOrComponent, options) {
  let component;
  if (isComponent(templateFactoryOrComponent)) {
    component = templateFactoryOrComponent;
  } else {
    component = contextComponentFor(templateFactoryOrComponent, context);
  }
  const ownerToRenderFrom = options?.owner || owner;

  // `schedule` (not `run`) starts an autorun, so the first paint happens on a
  // later microtask. The legacy path paints from the `render` queue of an
  // autorun, so scheduling into `render` keeps the same first-paint timing.
  // Errors still reach the `setupOnerror` hook through the runloop.
  if (ownerToRenderFrom === owner && typeof owner.renderRootComponent === 'function') {
    schedule('render', () => owner.renderRootComponent(component));
  } else {
    schedule('render', () => renderComponent$1(component, {
      into: getRootElement(),
      owner: ownerToRenderFrom
    }));
  }
}

/**
  Renders using the private, legacy `view:-outlet`
*/
function renderLegacyOutlet(owner, context, templateFactoryOrComponent, options) {
  // SAFETY: this is all wildly unsafe, because it is all using private API.
  // At some point we should define a path forward for this kind of internal
  // API. For now, just flagging it as *NOT* being safe!
  const toplevelView = owner.lookup('-top-level-view:main');
  const OutletTemplate = lookupOutletTemplate(owner);
  const ownerToRenderFrom = options?.owner || owner;
  let renderContext = context;
  let toRender = templateFactoryOrComponent;
  if (isComponent(toRender)) {
    renderContext = {
      ProvidedComponent: toRender
    };
    toRender = INVOKE_PROVIDED_COMPONENT;
  }
  templateId += 1;
  const templateFullName = `template:-undertest-${templateId}`;
  ownerToRenderFrom.register(templateFullName, toRender);
  const template = lookupTemplate(ownerToRenderFrom, templateFullName);
  const outletState = {
    render: {
      owner,
      // always use the host app owner for application outlet
      into: undefined,
      outlet: 'main',
      name: 'application',
      controller: undefined,
      ViewClass: undefined,
      template: OutletTemplate
    },
    outlets: {
      main: {
        render: {
          owner: ownerToRenderFrom,
          // the actual owner to be used for any lookups
          into: undefined,
          outlet: 'main',
          name: 'index',
          controller: renderContext,
          ViewClass: undefined,
          template,
          outlets: {}
        },
        outlets: {}
      }
    }
  };
  toplevelView.setOutletState(outletState);
}

/**
  Renders the provided template and appends it to the DOM.

  @public
  @param {Template|Component} templateFactoryOrComponent the component (or template) to render
  @param {RenderOptions} options options hash containing engine owner ({ owner: engineOwner })
  @returns {Promise<void>} resolves when settled

  @example
  <caption>
    Render a div element with the class 'container'.
  </caption>
  await render(hbs`<div class="container"></div>`);
*/
function render(templateFactoryOrComponent, options) {
  const context = getContext();
  if (!templateFactoryOrComponent) {
    throw new Error('you must pass a template to `render()`');
  }
  return Promise.resolve().then(() => runHooks('render', 'start')).then(() => {
    if (!context || !isRenderingTestContext(context)) {
      throw new Error('Cannot call `render` without having first called `setupRenderingContext`.');
    }
    const {
      owner
    } = context;
    const testMetadata = getTestMetadata(context);
    testMetadata.usedHelpers.push('render');
    if (renderComponent$1) {
      // modern `renderComponent` path
      renderViaRenderComponent(owner, context, templateFactoryOrComponent, options);
    } else {
      // Legacy `view:-outlet` lookup path
      renderLegacyOutlet(owner, context, templateFactoryOrComponent, options);
    }

    // returning settled here because the actual rendering does not happen until
    // the renderer detects it is dirty (which happens on backburner's end
    // hook), see the following implementation details:
    //
    // * [view:outlet](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/views/outlet.js#L129-L145) manually dirties its own tag upon `setOutletState`
    // * [backburner's custom end hook](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/renderer.js#L145-L159) detects that the current revision of the root is no longer the latest, and triggers a new rendering transaction
    return settled();
  }).then(() => runHooks('render', 'end'));
}

/**
  Clears any templates previously rendered. This is commonly used for
  confirming behavior that is triggered by teardown (e.g.
  `willDestroyElement`).

  @public
  @returns {Promise<void>} resolves when settled
*/
function clearRender() {
  const context = getContext();
  if (!context || !isRenderingTestContext(context)) {
    throw new Error('Cannot call `clearRender` without having first called `setupRenderingContext`.');
  }
  return render(EMPTY_TEMPLATE);
}

/**
  Used by test framework addons to setup the provided context for rendering.

  `setupContext` must have been ran on the provided context
  prior to calling `setupRenderingContext`.

  Responsible for:

  - Setup the basic framework used for rendering by the
    `render` helper.
  - Ensuring the event dispatcher is properly setup.
  - Setting `this.element` to the root element of the testing
    container (things rendered via `render` will go _into_ this
    element).

  @public
  @param {TestContext} context the context to setup for rendering
  @returns {Promise<RenderingTestContext>} resolves with the context that was setup

  @example
  <caption>
    Rendering out a paragraph element containing the content 'hello', and then clearing that content via clearRender.
  </caption>

  await render(hbs`<p>Hello!</p>`);
  assert.equal(this.element.textContent, 'Hello!', 'has rendered content');
  await clearRender();
  assert.equal(this.element.textContent, '', 'has rendered content');
*/
function setupRenderingContext(context) {
  const testMetadata = getTestMetadata(context);
  testMetadata.setupTypes.push('setupRenderingContext');
  const renderingContext = prepare(context);
  return Promise.resolve().then(() => {
    const {
      owner
    } = renderingContext;

    // When the host app uses `setApplication` (instead of `setResolver`) the event dispatcher has
    // already been setup via `applicationInstance.boot()` in `./build-owner`. If using
    // `setResolver` (instead of `setApplication`) a "mock owner" is created by extending
    // `Ember._ContainerProxyMixin` and `Ember._RegistryProxyMixin` in this scenario we need to
    // manually start the event dispatcher.
    if (owner._emberTestHelpersMockOwner) {
      const dispatcher = owner.lookup('event_dispatcher:main') || EventDispatcher.create();
      dispatcher.setup({}, '#ember-testing');
    }
    if (renderComponent$1) {
      if (supportsRenderRootComponent(owner)) {
        owner.rootElement = getRootElement();
      }
      return render(EMPTY_TEMPLATE);
    }

    // Classic `-outlet` fallback for older Ember versions.
    const OutletView = owner.factoryFor ? owner.factoryFor('view:-outlet') : owner._lookupFactory('view:-outlet');
    const environment = owner.lookup('-environment:main');
    const template = owner.lookup('template:-outlet');
    const toplevelView = OutletView.create({
      template,
      environment
    });
    owner.register('-top-level-view:main', {
      create() {
        return toplevelView;
      }
    });

    // initially render a simple empty template
    return render(EMPTY_TEMPLATE).then(() => {
      run(toplevelView, 'appendTo', getRootElement());
      return settled();
    });
  }).then(() => {
    Object.defineProperty(renderingContext, 'element', {
      configurable: true,
      enumerable: true,
      // In older Ember versions (2.4) the element itself is not stable,
      // and therefore we cannot update the `this.element` until after the
      // rendering is completed
      value: getRootElement(),
      writable: false
    });
    return renderingContext;
  });
}

let renderSettled;
if (macroCondition(dependencySatisfies('ember-source', '>=4.5.0-beta.1'))) {
  //@ts-ignore
  renderSettled = importSync('@ember/renderer').renderSettled;
} else {
  //@ts-ignore
  renderSettled = importSync('@ember/-internals/glimmer').renderSettled;
}
var renderSettled$1 = renderSettled;

/**
  Returns a promise which will resolve when rendering has completed. In
  this context, rendering is completed when all auto-tracked state that is
  consumed in the template (including any tracked state in models, services,
  etc.  that are then used in a template) has been updated in the DOM.

  For example, in a test you might want to update some tracked state and
  then run some assertions after rendering has completed. You _could_ use
  `await settled()` in that location, but in some contexts you don't want to
  wait for full settledness (which includes test waiters, pending AJAX/fetch,
  run loops, etc) but instead only want to know when that updated value has
  been rendered in the DOM. **THAT** is what `await rerender()` is _perfect_
  for.
  @public
  @returns {Promise<void>} a promise which fulfills when rendering has completed
*/
function rerender() {
  return renderSettled$1();
}

// Private API
const VALID = Object.freeze({
  isValid: true,
  message: null
});
const INVALID = Object.freeze({
  isValid: false,
  message: 'error handler should have re-thrown the provided error'
});

/**
 * Validate the provided error handler to confirm that it properly re-throws
 * errors when `Ember.testing` is true.
 *
 * This is intended to be used by test framework hosts (or other libraries) to
 * ensure that `Ember.onerror` is properly configured. Without a check like
 * this, `Ember.onerror` could _easily_ swallow all errors and make it _seem_
 * like everything is just fine (and have green tests) when in reality
 * everything is on fire...
 *
 * @public
 * @param {Function} [callback=Ember.onerror] the callback to validate
 * @returns {Object} object with `isValid` and `message`
 *
 * @example <caption>Example implementation for `ember-qunit`</caption>
 *
 * import { validateErrorHandler } from '@ember/test-helpers';
 *
 * test('Ember.onerror is functioning properly', function(assert) {
 *   let result = validateErrorHandler();
 *   assert.ok(result.isValid, result.message);
 * });
 */
function validateErrorHandler(callback = getOnerror()) {
  if (callback === undefined || callback === null) {
    return VALID;
  }
  const error = new Error('Error handler validation error!');
  const originalEmberTesting = isTesting();
  setTesting(true);
  try {
    callback(error);
  } catch (e) {
    if (e === error) {
      return VALID;
    }
  } finally {
    setTesting(originalEmberTesting);
  }
  return INVALID;
}

/**
  Used internally by the DOM interaction helpers to find one element.

  @private
  @param {string|Element} target the element or selector to retrieve
  @returns {Element} the target or selector
*/
function getElement(target) {
  if (typeof target === 'string') {
    const rootElement = getRootElement();
    return rootElement.querySelector(target);
  } else if (isElement(target) || isDocument(target)) {
    return target;
  } else if (target instanceof Window) {
    return target.document;
  } else {
    const descriptorData = lookupDescriptorData(target);
    if (descriptorData) {
      return resolveDOMElement(descriptorData);
    } else {
      throw new Error('Must use an element, selector string, or DOM element descriptor');
    }
  }
}

/**
  Used internally by the DOM interaction helpers to find either window or an element.

  @private
  @param {string|Element} target the window, an element or selector to retrieve
  @returns {Element|Window} the target or selector
*/
function getWindowOrElement(target) {
  if (isWindow(target)) {
    return target;
  }
  return getElement(target);
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type

// eslint-disable-next-line require-jsdoc
function tuple(...args) {
  return args;
}

registerHook('fireEvent', 'start', target => {
  log('fireEvent', target);
});

// eslint-disable-next-line require-jsdoc
const MOUSE_EVENT_CONSTRUCTOR = (() => {
  try {
    new MouseEvent('test');
    return true;
  } catch {
    return false;
  }
})();
const DEFAULT_EVENT_OPTIONS = {
  bubbles: true,
  cancelable: true
};
const KEYBOARD_EVENT_TYPES = tuple('keydown', 'keypress', 'keyup');
// eslint-disable-next-line require-jsdoc
function isKeyboardEventType(eventType) {
  return KEYBOARD_EVENT_TYPES.indexOf(eventType) > -1;
}
const MOUSE_EVENT_TYPES = tuple('click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover');
// eslint-disable-next-line require-jsdoc
function isMouseEventType(eventType) {
  return MOUSE_EVENT_TYPES.indexOf(eventType) > -1;
}
const FILE_SELECTION_EVENT_TYPES = tuple('change');
// eslint-disable-next-line require-jsdoc
function isFileSelectionEventType(eventType) {
  return FILE_SELECTION_EVENT_TYPES.indexOf(eventType) > -1;
}

// eslint-disable-next-line require-jsdoc
function isFileSelectionInput(element) {
  return element.files;
}
/**
  Internal helper used to build and dispatch events throughout the other DOM helpers.

  @private
  @param {Element} element the element to dispatch the event to
  @param {string} eventType the type of event
  @param {Object} [options] additional properties to be set on the event
  @returns {Event} the event that was dispatched
*/
function fireEvent(element, eventType, options = {}) {
  return Promise.resolve().then(() => runHooks('fireEvent', 'start', element)).then(() => runHooks(`fireEvent:${eventType}`, 'start', element)).then(() => {
    if (!element) {
      throw new Error('Must pass an element to `fireEvent`');
    }
    let event;
    if (isKeyboardEventType(eventType)) {
      event = _buildKeyboardEvent(eventType, options);
    } else if (isMouseEventType(eventType)) {
      let rect;
      if (element instanceof Window && element.document.documentElement) {
        rect = element.document.documentElement.getBoundingClientRect();
      } else if (isDocument(element)) {
        rect = element.documentElement.getBoundingClientRect();
      } else if (isElement(element)) {
        rect = element.getBoundingClientRect();
      } else {
        return;
      }
      const x = rect.left + 1;
      const y = rect.top + 1;
      const simulatedCoordinates = {
        screenX: x + 5,
        // Those numbers don't really mean anything.
        screenY: y + 95,
        // They're just to make the screenX/Y be different of clientX/Y..
        clientX: x,
        clientY: y,
        ...options
      };
      event = buildMouseEvent(eventType, simulatedCoordinates);
    } else if (isFileSelectionEventType(eventType) && isFileSelectionInput(element)) {
      event = buildFileEvent(eventType, element, options);
    } else {
      event = buildBasicEvent(eventType, options);
    }
    element.dispatchEvent(event);
    return event;
  }).then(event => runHooks(`fireEvent:${eventType}`, 'end', element).then(() => event)).then(event => runHooks('fireEvent', 'end', element).then(() => event));
}

// eslint-disable-next-line require-jsdoc
function buildBasicEvent(type, options = {}) {
  const event = document.createEvent('Events');
  const bubbles = options.bubbles !== undefined ? options.bubbles : true;
  const cancelable = options.cancelable !== undefined ? options.cancelable : true;
  delete options.bubbles;
  delete options.cancelable;

  // bubbles and cancelable are readonly, so they can be
  // set when initializing event
  event.initEvent(type, bubbles, cancelable);
  for (const prop in options) {
    event[prop] = options[prop];
  }
  return event;
}

// eslint-disable-next-line require-jsdoc
function buildMouseEvent(type, options = {}) {
  let event;
  const eventOpts = {
    view: window,
    ...DEFAULT_EVENT_OPTIONS,
    ...options
  };
  if (MOUSE_EVENT_CONSTRUCTOR) {
    event = new MouseEvent(type, eventOpts);
  } else {
    try {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent(type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch {
      event = buildBasicEvent(type, options);
    }
  }
  return event;
}

// @private
// eslint-disable-next-line require-jsdoc
function _buildKeyboardEvent(type, options = {}) {
  const eventOpts = {
    ...DEFAULT_EVENT_OPTIONS,
    ...options
  };
  let event;
  let eventMethodName;
  try {
    event = new KeyboardEvent(type, eventOpts);

    // Property definitions are required for B/C for keyboard event usage
    // If this properties are not defined, when listening for key events
    // keyCode/which will be 0. Also, keyCode and which now are string
    // and if app compare it with === with integer key definitions,
    // there will be a fail.
    //
    // https://w3c.github.io/uievents/#interface-keyboardevent
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    Object.defineProperty(event, 'keyCode', {
      get() {
        return parseInt(eventOpts.keyCode);
      }
    });
    Object.defineProperty(event, 'which', {
      get() {
        return parseInt(eventOpts.which);
      }
    });
    return event;
  } catch {
    // left intentionally blank
  }
  try {
    event = document.createEvent('KeyboardEvents');
    eventMethodName = 'initKeyboardEvent';
  } catch {
    // left intentionally blank
  }
  if (!event) {
    try {
      event = document.createEvent('KeyEvents');
      eventMethodName = 'initKeyEvent';
    } catch {
      // left intentionally blank
    }
  }
  if (event && eventMethodName) {
    event[eventMethodName](type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
  } else {
    event = buildBasicEvent(type, options);
  }
  return event;
}

// eslint-disable-next-line require-jsdoc
function buildFileEvent(type, element, options = {}) {
  const event = buildBasicEvent(type);
  const files = options.files;
  if (Array.isArray(options)) {
    throw new Error('Please pass an object with a files array to `triggerEvent` instead of passing the `options` param as an array to.');
  }
  if (Array.isArray(files)) {
    Object.defineProperty(files, 'item', {
      value(index) {
        return typeof index === 'number' ? this[index] : null;
      },
      configurable: true
    });
    Object.defineProperty(element, 'files', {
      value: files,
      configurable: true
    });
    const elementProto = Object.getPrototypeOf(element);
    const valueProp = Object.getOwnPropertyDescriptor(elementProto, 'value');
    Object.defineProperty(element, 'value', {
      configurable: true,
      get() {
        return valueProp.get.call(element);
      },
      set(value) {
        valueProp.set.call(element, value);

        // We are sure that the value is empty here.
        // For a non-empty value the original setter must raise an exception.
        Object.defineProperty(element, 'files', {
          configurable: true,
          value: []
        });
      }
    });
  }
  Object.defineProperty(event, 'target', {
    value: element
  });
  return event;
}

// For reference:
// https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
const FOCUSABLE_TAGS = ['A', 'SUMMARY'];
// eslint-disable-next-line require-jsdoc
function isFocusableElement(element) {
  return FOCUSABLE_TAGS.indexOf(element.tagName) > -1;
}

/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is focusable, `false` otherwise
*/
function isFocusable(element) {
  if (isWindow(element)) {
    return false;
  }
  if (isDocument(element)) {
    return false;
  }
  if (isFormControl(element)) {
    return !element.disabled;
  }
  if (isContentEditable(element) || isFocusableElement(element)) {
    return true;
  }
  return element.hasAttribute('tabindex');
}

/**
  Used internally by the DOM interaction helpers to get a description of a
  target for debug/error messaging.

  @private
  @param {Target} target the target
  @returns {string} a description of the target
*/
function getDescription(target) {
  const data = isDescriptor(target) ? lookupDescriptorData(target) : null;
  if (data) {
    return data.description || '<unknown descriptor>';
  } else {
    return `${target}`;
  }
}

registerHook('blur', 'start', target => {
  log('blur', target);
});

/**
  @private
  @param {Element} element the element to trigger events on
  @param {Element} relatedTarget the element that is focused after blur
  @return {Promise<Event | void>} resolves when settled
*/
function __blur__(element, relatedTarget = null) {
  if (!isFocusable(element)) {
    throw new Error(`${element} is not focusable`);
  }
  const browserIsNotFocused = document.hasFocus && !document.hasFocus();
  const needsCustomEventOptions = relatedTarget !== null;
  if (!needsCustomEventOptions) {
    // makes `document.activeElement` be `body`.
    // If the browser is focused, it also fires a blur event
    element.blur();
  }

  // Chrome/Firefox does not trigger the `blur` event if the window
  // does not have focus. If the document does not have focus then
  // fire `blur` event via native event.
  const options = {
    relatedTarget
  };
  return browserIsNotFocused || needsCustomEventOptions ? Promise.resolve().then(() => fireEvent(element, 'blur', {
    bubbles: false,
    ...options
  })).then(() => fireEvent(element, 'focusout', options)) : Promise.resolve();
}

/**
  Unfocus the specified target.

  Sends a number of events intending to simulate a "real" user unfocusing an
  element.

  The following events are triggered (in order):

  - `blur`
  - `focusout`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle unfocusing a given element.

  @public
  @param {string|Element|IDOMElementDescriptor} [target=document.activeElement] the element, selector, or descriptor to unfocus
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating blurring an input using `blur`
  </caption>

  blur('input');
*/
function blur(target = document.activeElement) {
  return Promise.resolve().then(() => runHooks('blur', 'start', target)).then(() => {
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`blur('${description}')\`.`);
    }
    return __blur__(element).then(() => settled());
  }).then(() => runHooks('blur', 'end', target));
}

registerHook('focus', 'start', target => {
  log('focus', target);
});
/**
   Get the closest focusable ancestor of a given element (or the element itself
   if it's focusable)

   @private
   @param {Element} element the element to trigger events on
   @returns {HTMLElement|SVGElement|null} the focusable element/ancestor or null
   if there is none
 */
function getClosestFocusable(element) {
  if (isDocument(element)) {
    return null;
  }
  let maybeFocusable = element;
  while (maybeFocusable && !isFocusable(maybeFocusable)) {
    maybeFocusable = maybeFocusable.parentElement;
  }
  return maybeFocusable;
}

/**
  @private
  @param {Element} element the element to trigger events on
  @return {Promise<FocusRecord | Event | void>} resolves when settled
*/
function __focus__(element) {
  return Promise.resolve().then(() => {
    const focusTarget = getClosestFocusable(element);
    const previousFocusedElement = document.activeElement && document.activeElement !== focusTarget && isFocusable(document.activeElement) ? document.activeElement : null;

    // fire __blur__ manually with the null relatedTarget when the target is not focusable
    // and there was a previously focused element
    return !focusTarget && previousFocusedElement ? __blur__(previousFocusedElement, null).then(() => Promise.resolve({
      focusTarget,
      previousFocusedElement
    })) : Promise.resolve({
      focusTarget,
      previousFocusedElement
    });
  }).then(({
    focusTarget,
    previousFocusedElement
  }) => {
    if (!focusTarget) {
      throw new Error('There was a previously focused element');
    }
    const browserIsNotFocused = !document?.hasFocus();

    // fire __blur__ manually with the correct relatedTarget when the browser is not
    // already in focus and there was a previously focused element
    return previousFocusedElement && browserIsNotFocused ? __blur__(previousFocusedElement, focusTarget).then(() => Promise.resolve({
      focusTarget
    })) : Promise.resolve({
      focusTarget
    });
  }).then(({
    focusTarget
  }) => {
    // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event
    focusTarget.focus();

    // Firefox does not trigger the `focusin` event if the window
    // does not have focus. If the document does not have focus then
    // fire `focusin` event as well.
    const browserIsFocused = document?.hasFocus();
    return browserIsFocused ? Promise.resolve() :
    // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
    Promise.resolve().then(() => fireEvent(focusTarget, 'focus', {
      bubbles: false
    })).then(() => fireEvent(focusTarget, 'focusin')).then(() => settled());
  }).catch(() => {});
}

/**
  Focus the specified target.

  Sends a number of events intending to simulate a "real" user focusing an
  element.

  The following events are triggered (in order):

  - `focus`
  - `focusin`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle focusing a given element.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to focus
  @return {Promise<void>} resolves when the application is settled

  @example
  <caption>
    Emulating focusing an input using `focus`
  </caption>

  focus('input');
*/
function focus(target) {
  return Promise.resolve().then(() => runHooks('focus', 'start', target)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `focus`.');
    }
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`focus('${description}')\`.`);
    }
    if (!isFocusable(element)) {
      throw new Error(`${element} is not focusable`);
    }
    return __focus__(element).then(settled);
  }).then(() => runHooks('focus', 'end', target));
}

const PRIMARY_BUTTON = 1;
const MAIN_BUTTON_PRESSED = 0;
registerHook('click', 'start', target => {
  log('click', target);
});

/**
 * Represent a particular mouse button being clicked.
 * See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons for available options.
 */
const DEFAULT_CLICK_OPTIONS = {
  buttons: PRIMARY_BUTTON,
  button: MAIN_BUTTON_PRESSED
};

/**
  @private
  @param {Element} element the element to click on
  @param {MouseEventInit} options the options to be merged into the mouse events
  @return {Promise<Event | void>} resolves when settled
*/
function __click__(element, options) {
  return Promise.resolve().then(() => fireEvent(element, 'mousedown', options)).then(mouseDownEvent => !isWindow(element) && !mouseDownEvent?.defaultPrevented ? __focus__(element) : Promise.resolve()).then(() => fireEvent(element, 'mouseup', options)).then(() => fireEvent(element, 'click', options));
}

/**
  Clicks on the specified target.

  Sends a number of events intending to simulate a "real" user clicking on an
  element.

  For non-focusable elements the following events are triggered (in order):

  - `mousedown`
  - `mouseup`
  - `click`

  For focusable (e.g. form control) elements the following events are triggered
  (in order):

  - `mousedown`
  - `focus`
  - `focusin`
  - `mouseup`
  - `click`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle clicking a given element.

  Use the `options` hash to change the parameters of the [MouseEvents](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent).
  You can use this to specify modifier keys as well.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to click on
  @param {MouseEventInit} _options the options to be merged into the mouse events.
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating clicking a button using `click`
  </caption>
  click('button');

  @example
  <caption>
    Emulating clicking a button and pressing the `shift` key simultaneously using `click` with `options`.
  </caption>

  click('button', { shiftKey: true });
*/
function click(target, _options = {}) {
  const options = {
    ...DEFAULT_CLICK_OPTIONS,
    ..._options
  };
  return Promise.resolve().then(() => runHooks('click', 'start', target, _options)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `click`.');
    }
    const element = getWindowOrElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`click('${description}')\`.`);
    }
    if (isFormControl(element) && element.disabled) {
      throw new Error(`Can not \`click\` disabled ${element}`);
    }
    return __click__(element, options).then(settled);
  }).then(() => runHooks('click', 'end', target, _options));
}

registerHook('doubleClick', 'start', target => {
  log('doubleClick', target);
});

/**
  @private
  @param {Element} element the element to double-click on
  @param {MouseEventInit} options the options to be merged into the mouse events
  @returns {Promise<Event | void>} resolves when settled
*/
function __doubleClick__(element, options) {
  return Promise.resolve().then(() => fireEvent(element, 'mousedown', options)).then(mouseDownEvent => {
    return !isWindow(element) && !mouseDownEvent?.defaultPrevented ? __focus__(element) : Promise.resolve();
  }).then(() => fireEvent(element, 'mouseup', options)).then(() => fireEvent(element, 'click', options)).then(() => fireEvent(element, 'mousedown', options)).then(() => fireEvent(element, 'mouseup', options)).then(() => fireEvent(element, 'click', options)).then(() => fireEvent(element, 'dblclick', options));
}

/**
  Double-clicks on the specified target.

  Sends a number of events intending to simulate a "real" user clicking on an
  element.

  For non-focusable elements the following events are triggered (in order):

  - `mousedown`
  - `mouseup`
  - `click`
  - `mousedown`
  - `mouseup`
  - `click`
  - `dblclick`

  For focusable (e.g. form control) elements the following events are triggered
  (in order):

  - `mousedown`
  - `focus`
  - `focusin`
  - `mouseup`
  - `click`
  - `mousedown`
  - `mouseup`
  - `click`
  - `dblclick`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle clicking a given element.

  Use the `options` hash to change the parameters of the [MouseEvents](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent).

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to double-click on
  @param {MouseEventInit} _options the options to be merged into the mouse events
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating double clicking a button using `doubleClick`
  </caption>

  doubleClick('button');

  @example
  <caption>
    Emulating double clicking a button and pressing the `shift` key simultaneously using `click` with `options`.
  </caption>

  doubleClick('button', { shiftKey: true });
*/
function doubleClick(target, _options = {}) {
  const options = {
    ...DEFAULT_CLICK_OPTIONS,
    ..._options
  };
  return Promise.resolve().then(() => runHooks('doubleClick', 'start', target, _options)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `doubleClick`.');
    }
    const element = getWindowOrElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`doubleClick('${description}')\`.`);
    }
    if (isFormControl(element) && element.disabled) {
      throw new Error(`Can not \`doubleClick\` disabled ${element}`);
    }
    return __doubleClick__(element, options).then(settled);
  }).then(() => runHooks('doubleClick', 'end', target, _options));
}

const SUPPORTS_INERT = 'inert' in Element.prototype;
const FALLBACK_ELEMENTS = ['CANVAS', 'VIDEO', 'PICTURE'];
registerHook('tab', 'start', target => {
  log('tab', target);
});

/**
  Gets the active element of a document. IE11 may return null instead of the body as
  other user-agents does when there isn’t an active element.
  @private
  @param {Document} ownerDocument the element to check
  @returns {HTMLElement} the active element of the document
*/
function getActiveElement(ownerDocument) {
  return ownerDocument.activeElement || ownerDocument.body;
}
/**
  Compiles a list of nodes that can be focused. Walks the tree, discards hidden elements and a few edge cases. To calculate the right.
  @private
  @param {Element} root the root element to start traversing on
  @returns {Array} list of focusable nodes
*/
function compileFocusAreas(root = document.body) {
  const {
    ownerDocument
  } = root;
  if (!ownerDocument) {
    throw new Error('Element must be in the DOM');
  }
  const activeElement = getActiveElement(ownerDocument);
  const treeWalker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: node => {
      // Only visible nodes can be focused, with, at least, one exception; the "area" element.
      // reference: https://html.spec.whatwg.org/multipage/interaction.html#data-model
      if (node.tagName !== 'AREA' && isVisible(node) === false) {
        return NodeFilter.FILTER_REJECT;
      }

      // Reject any fallback elements. Fallback elements’s children are only rendered if the UA
      // doesn’t support the element. We make an assumption that they are always supported, we
      // could consider feature detecting every node type, or making it configurable.
      const parentNode = node.parentNode;
      if (parentNode && FALLBACK_ELEMENTS.indexOf(parentNode.tagName) !== -1) {
        return NodeFilter.FILTER_REJECT;
      }

      // Rejects inert containers, if the user agent supports the feature (or if a polyfill is installed.)
      if (SUPPORTS_INERT && node.inert) {
        return NodeFilter.FILTER_REJECT;
      }
      if (isDisabled(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      // Always accept the 'activeElement' of the document, as it might fail the next check, elements with tabindex="-1"
      // can be focused programmatically, we'll therefor ensure the current active element is in the list.
      if (node === activeElement) {
        return NodeFilter.FILTER_ACCEPT;
      }

      // UA parses the tabindex attribute and applies its default values, If the tabIndex is non negative, the UA can
      // focus it.
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  let node;
  const elements = [];
  while (node = treeWalker.nextNode()) {
    elements.push(node);
  }
  return elements;
}

/**
  Sort elements by their tab indices.
  As older browsers doesn't necessarily implement stabile sort, we'll have to
  manually compare with the index in the original array.
  @private
  @param {Array<HTMLElement>} elements to sort
  @returns {Array<HTMLElement>} list of sorted focusable nodes by their tab index
*/
function sortElementsByTabIndices(elements) {
  return elements.map((element, index) => {
    return {
      index,
      element
    };
  }).sort((a, b) => {
    if (a.element.tabIndex === b.element.tabIndex) {
      return a.index - b.index;
    } else if (a.element.tabIndex === 0 || b.element.tabIndex === 0) {
      return b.element.tabIndex - a.element.tabIndex;
    }
    return a.element.tabIndex - b.element.tabIndex;
  }).map(entity => entity.element);
}

/**
  @private
  @param {Element} root The root element or node to start traversing on.
  @param {HTMLElement} activeElement The element to find the next and previous focus areas of
  @returns {object} The next and previous focus areas of the active element
 */
function findNextResponders(root, activeElement) {
  const focusAreas = compileFocusAreas(root);
  const sortedFocusAreas = sortElementsByTabIndices(focusAreas);
  const elements = activeElement.tabIndex === -1 ? focusAreas : sortedFocusAreas;
  const index = elements.indexOf(activeElement);
  if (index === -1) {
    return {
      next: sortedFocusAreas[0],
      previous: sortedFocusAreas[sortedFocusAreas.length - 1]
    };
  }
  return {
    next: elements[index + 1],
    previous: elements[index - 1]
  };
}

/**
  Emulates the user pressing the tab button.

  Sends a number of events intending to simulate a "real" user pressing tab on their
  keyboard.

  @public
  @param {Object} [options] optional tab behaviors
  @param {boolean} [options.backwards=false] indicates if the the user navigates backwards
  @param {boolean} [options.unRestrainTabIndex=false] indicates if tabbing should throw an error when tabindex is greater than 0
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating pressing the `TAB` key
  </caption>
  tab();

  @example
  <caption>
    Emulating pressing the `SHIFT`+`TAB` key combination
  </caption>
  tab({ backwards: true });
*/
function triggerTab({
  backwards = false,
  unRestrainTabIndex = false
} = {}) {
  return Promise.resolve().then(() => {
    return triggerResponderChange(backwards, unRestrainTabIndex);
  }).then(() => {
    return settled();
  });
}

/**
  @private
  @param {boolean} backwards when `true` it selects the previous focus area
  @param {boolean} unRestrainTabIndex when `true`, will not throw an error if tabindex > 0 is encountered
  @returns {Promise<void>} resolves when all events are fired
 */
function triggerResponderChange(backwards, unRestrainTabIndex) {
  const root = getRootElement();
  let ownerDocument;
  let rootElement;
  if (isDocument(root)) {
    rootElement = root.body;
    ownerDocument = root;
  } else {
    rootElement = root;
    ownerDocument = root.ownerDocument;
  }
  const keyboardEventOptions = {
    keyCode: 9,
    which: 9,
    key: 'Tab',
    code: 'Tab',
    shiftKey: backwards
  };
  const debugData = {
    keyboardEventOptions,
    ownerDocument,
    rootElement
  };
  return Promise.resolve().then(() => runHooks('tab', 'start', debugData)).then(() => getActiveElement(ownerDocument)).then(activeElement => runHooks('tab', 'targetFound', activeElement).then(() => activeElement)).then(activeElement => {
    const event = _buildKeyboardEvent('keydown', keyboardEventOptions);
    const defaultNotPrevented = activeElement.dispatchEvent(event);
    if (defaultNotPrevented) {
      // Query the active element again, as it might change during event phase
      activeElement = getActiveElement(ownerDocument);
      const target = findNextResponders(rootElement, activeElement);
      if (target) {
        if (backwards && target.previous) {
          return __focus__(target.previous);
        } else if (!backwards && target.next) {
          return __focus__(target.next);
        } else {
          return __blur__(activeElement);
        }
      }
    }
    return Promise.resolve();
  }).then(() => {
    const activeElement = getActiveElement(ownerDocument);
    return fireEvent(activeElement, 'keyup', keyboardEventOptions).then(() => activeElement);
  }).then(activeElement => {
    if (!unRestrainTabIndex && activeElement.tabIndex > 0) {
      throw new Error(`tabindex of greater than 0 is not allowed. Found tabindex=${activeElement.tabIndex}`);
    }
  }).then(() => runHooks('tab', 'end', debugData));
}

registerHook('tap', 'start', target => {
  log('tap', target);
});

/**
  Taps on the specified target.

  Sends a number of events intending to simulate a "real" user tapping on an
  element.

  For non-focusable elements the following events are triggered (in order):

  - `touchstart`
  - `touchend`
  - `mousedown`
  - `mouseup`
  - `click`

  For focusable (e.g. form control) elements the following events are triggered
  (in order):

  - `touchstart`
  - `touchend`
  - `mousedown`
  - `focus`
  - `focusin`
  - `mouseup`
  - `click`

  The exact listing of events that are triggered may change over time as needed
  to continue to emulate how actual browsers handle tapping on a given element.

  Use the `options` hash to change the parameters of the tap events.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to tap on
  @param {Object} options the options to be merged into the touch events
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Emulating tapping a button using `tap`
  </caption>

  tap('button');
*/
function tap(target, options = {}) {
  return Promise.resolve().then(() => {
    return runHooks('tap', 'start', target, options);
  }).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `tap`.');
    }
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`tap('${description}')\`.`);
    }
    if (isFormControl(element) && element.disabled) {
      throw new Error(`Can not \`tap\` disabled ${element}`);
    }
    return fireEvent(element, 'touchstart', options).then(touchstartEv => fireEvent(element, 'touchend', options).then(touchendEv => [touchstartEv, touchendEv])).then(([touchstartEv, touchendEv]) => !touchstartEv.defaultPrevented && !touchendEv.defaultPrevented ? __click__(element, options) : Promise.resolve()).then(settled);
  }).then(() => {
    return runHooks('tap', 'end', target, options);
  });
}

registerHook('triggerEvent', 'start', (target, eventType) => {
  log('triggerEvent', target, eventType);
});

/**
 * Triggers an event on the specified target.
 *
 * @public
 * @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to trigger the event on
 * @param {string} eventType the type of event to trigger
 * @param {Object} options additional properties to be set on the event
 * @param {boolean} force if true, will bypass availability checks (false by default)
 * @return {Promise<void>} resolves when the application is settled
 *
 * @example
 * <caption>
 * Using `triggerEvent` to upload a file
 *
 * When using `triggerEvent` to upload a file the `eventType` must be `change` and you must pass the
 * `options` param as an object with a key `files` containing an array of
 * [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
 * </caption>
 *
 * triggerEvent(
 *   'input.fileUpload',
 *   'change',
 *   { files: [new Blob(['Ember Rules!'])] }
 * );
 *
 *
 * @example
 * <caption>
 * Using `triggerEvent` to upload a dropped file
 *
 * When using `triggerEvent` to handle a dropped (via drag-and-drop) file, the `eventType` must be `drop`. Assuming your `drop` event handler uses the [DataTransfer API](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer),
 * you must pass the `options` param as an object with a key of `dataTransfer`. The `options.dataTransfer`     object should have a `files` key, containing an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).
 * </caption>
 *
 * triggerEvent(
 *   '[data-test-drop-zone]',
 *   'drop',
 *   {
 *     dataTransfer: {
 *       files: [new File(['Ember Rules!'], 'ember-rules.txt')]
 *     }
 *   }
 * )
 */
function triggerEvent(target, eventType, options, force = false) {
  return Promise.resolve().then(() => {
    return runHooks('triggerEvent', 'start', target, eventType, options);
  }).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `triggerEvent`.');
    }
    if (!eventType) {
      throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
    }
    const element = getWindowOrElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`triggerEvent('${description}', ...)\`.`);
    }
    if (!force && isFormControl(element) && element.disabled) {
      throw new Error(`Can not \`triggerEvent\` on disabled ${element}`);
    }
    return fireEvent(element, eventType, options).then(settled);
  }).then(() => {
    return runHooks('triggerEvent', 'end', target, eventType, options);
  });
}

registerHook('triggerKeyEvent', 'start', (target, eventType, key) => {
  log('triggerKeyEvent', target, eventType, key);
});
const DEFAULT_MODIFIERS = Object.freeze({
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false
});

// This is not a comprehensive list, but it is better than nothing.
const keyFromKeyCode = {
  8: 'Backspace',
  9: 'Tab',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z',
  91: 'Meta',
  93: 'Meta',
  // There is two keys that map to meta,
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  219: '[',
  220: '\\',
  221: ']',
  222: "'"
};
const keyFromKeyCodeWithShift = {
  48: ')',
  49: '!',
  50: '@',
  51: '#',
  52: '$',
  53: '%',
  54: '^',
  55: '&',
  56: '*',
  57: '(',
  186: ':',
  187: '+',
  188: '<',
  189: '_',
  190: '>',
  191: '?',
  219: '{',
  220: '|',
  221: '}',
  222: '"'
};

/**
  Calculates the value of KeyboardEvent#key given a keycode and the modifiers.
  Note that this works if the key is pressed in combination with the shift key, but it cannot
  detect if caps lock is enabled.
  @param {number} keycode The keycode of the event.
  @param {object} modifiers The modifiers of the event.
  @returns {string} The key string for the event.
 */
function keyFromKeyCodeAndModifiers(keycode, modifiers) {
  if (keycode > 64 && keycode < 91) {
    if (modifiers.shiftKey) {
      return String.fromCharCode(keycode);
    } else {
      return String.fromCharCode(keycode).toLocaleLowerCase();
    }
  }
  return modifiers.shiftKey && keyFromKeyCodeWithShift[keycode] || keyFromKeyCode[keycode];
}

/**
 * Infers the keycode from the given key
 * @param {string} key The KeyboardEvent#key string
 * @returns {number} The keycode for the given key
 */
function keyCodeFromKey(key) {
  const keys = Object.keys(keyFromKeyCode);
  const keyCode = keys.find(keyCode => keyFromKeyCode[Number(keyCode)] === key) || keys.find(keyCode => keyFromKeyCode[Number(keyCode)] === key.toLowerCase());
  return keyCode !== undefined ? parseInt(keyCode) : undefined;
}

/**
  @private
  @param {Element | Document} element the element to trigger the key event on
  @param {'keydown' | 'keyup' | 'keypress'} eventType the type of event to trigger
  @param {number|string} key the `keyCode`(number) or `key`(string) of the event being triggered
  @param {Object} [modifiers] the state of various modifier keys
  @return {Promise<Event>} resolves when settled
 */
function __triggerKeyEvent__(element, eventType, key, modifiers = DEFAULT_MODIFIERS) {
  return Promise.resolve().then(() => {
    let props;
    if (typeof key === 'number') {
      props = {
        keyCode: key,
        which: key,
        key: keyFromKeyCodeAndModifiers(key, modifiers),
        ...modifiers
      };
    } else if (typeof key === 'string' && key.length !== 0) {
      const firstCharacter = key[0];
      if (!firstCharacter || firstCharacter !== firstCharacter.toUpperCase()) {
        throw new Error(`Must provide a \`key\` to \`triggerKeyEvent\` that starts with an uppercase character but you passed \`${key}\`.`);
      }
      if (isNumeric(key) && key.length > 1) {
        throw new Error(`Must provide a numeric \`keyCode\` to \`triggerKeyEvent\` but you passed \`${key}\` as a string.`);
      }
      const keyCode = keyCodeFromKey(key);
      props = {
        keyCode,
        which: keyCode,
        key,
        ...modifiers
      };
    } else {
      throw new Error(`Must provide a \`key\` or \`keyCode\` to \`triggerKeyEvent\``);
    }
    return fireEvent(element, eventType, props);
  });
}

/**
  Triggers a keyboard event of given type in the target element.
  It also requires the developer to provide either a string with the [`key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
  or the numeric [`keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) of the pressed key.
  Optionally the user can also provide a POJO with extra modifiers for the event.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to trigger the event on
  @param {'keydown' | 'keyup' | 'keypress'} eventType the type of event to trigger
  @param {number|string} key the `keyCode`(number) or `key`(string) of the event being triggered
  @param {Object} [modifiers] the state of various modifier keys
  @param {boolean} [modifiers.ctrlKey=false] if true the generated event will indicate the control key was pressed during the key event
  @param {boolean} [modifiers.altKey=false] if true the generated event will indicate the alt key was pressed during the key event
  @param {boolean} [modifiers.shiftKey=false] if true the generated event will indicate the shift key was pressed during the key event
  @param {boolean} [modifiers.metaKey=false] if true the generated event will indicate the meta key was pressed during the key event
  @return {Promise<void>} resolves when the application is settled unless awaitSettled is false

  @example
  <caption>
    Emulating pressing the `ENTER` key on a button using `triggerKeyEvent`
  </caption>
  triggerKeyEvent('button', 'keydown', 'Enter');
*/
function triggerKeyEvent(target, eventType, key, modifiers = DEFAULT_MODIFIERS) {
  return Promise.resolve().then(() => {
    return runHooks('triggerKeyEvent', 'start', target, eventType, key);
  }).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `triggerKeyEvent`.');
    }
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`triggerKeyEvent('${description}')\`.`);
    }
    if (!eventType) {
      throw new Error(`Must provide an \`eventType\` to \`triggerKeyEvent\``);
    }
    if (!isKeyboardEventType(eventType)) {
      const validEventTypes = KEYBOARD_EVENT_TYPES.join(', ');
      throw new Error(`Must provide an \`eventType\` of ${validEventTypes} to \`triggerKeyEvent\` but you passed \`${eventType}\`.`);
    }
    if (isFormControl(element) && element.disabled) {
      throw new Error(`Can not \`triggerKeyEvent\` on disabled ${element}`);
    }
    return __triggerKeyEvent__(element, eventType, key, modifiers).then(settled);
  }).then(() => runHooks('triggerKeyEvent', 'end', target, eventType, key));
}

// ref: https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
const constrainedInputTypes = ['text', 'search', 'url', 'tel', 'email', 'password'];

/**
  @private
  @param {Element} element - the element to check
  @returns {boolean} `true` when the element should constrain input by the maxlength attribute, `false` otherwise
*/
function isMaxLengthConstrained(element) {
  return !!Number(element.getAttribute('maxlength')) && (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement && constrainedInputTypes.indexOf(element.type) > -1);
}

/**
 * @private
 * @param {Element} element - the element to check
 * @param {string} text - the text being added to element
 * @param {string} testHelper - the test helper context the guard is called from (for Error message)
 * @throws if `element` has `maxlength` & `value` exceeds `maxlength`
 */
function guardForMaxlength(element, text, testHelper) {
  const maxlength = element.getAttribute('maxlength');
  if (isMaxLengthConstrained(element) && maxlength && text && text.length > Number(maxlength)) {
    throw new Error(`Can not \`${testHelper}\` with text: '${text}' that exceeds maxlength: '${maxlength}'.`);
  }
}

registerHook('fillIn', 'start', (target, text) => {
  log('fillIn', target, text);
});

/**
  Fill the provided text into the `value` property (or set `.innerHTML` when
  the target is a content editable element) then trigger `change` and `input`
  events on the specified target.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to enter text into
  @param {string} text the text to fill into the target element
  @return {Promise<void>} resolves when the application is settled

  @example
  <caption>
    Emulating filling an input with text using `fillIn`
  </caption>

  fillIn('input', 'hello world');
*/
function fillIn(target, text) {
  return Promise.resolve().then(() => runHooks('fillIn', 'start', target, text)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `fillIn`.');
    }
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`fillIn('${description}')\`.`);
    }
    if (typeof text === 'undefined' || text === null) {
      throw new Error('Must provide `text` when calling `fillIn`.');
    }
    if (isFormControl(element)) {
      if (element.disabled) {
        throw new Error(`Can not \`fillIn\` disabled '${getDescription(target)}'.`);
      }
      if ('readOnly' in element && element.readOnly) {
        throw new Error(`Can not \`fillIn\` readonly '${getDescription(target)}'.`);
      }
      guardForMaxlength(element, text, 'fillIn');
      return __focus__(element).then(() => {
        element.value = text;
        return element;
      });
    } else if (isContentEditable(element)) {
      return __focus__(element).then(() => {
        element.innerHTML = text;
        return element;
      });
    } else {
      throw new Error('`fillIn` is only usable on form controls or contenteditable elements.');
    }
  }).then(element => fireEvent(element, 'input').then(() => fireEvent(element, 'change')).then(settled)).then(() => runHooks('fillIn', 'end', target, text));
}

/**
  @private
  @param {Element} element the element to check
  @returns {boolean} `true` when the element is a select element, `false` otherwise
*/
function isSelectElement(element) {
  return !isDocument(element) && element.tagName === 'SELECT';
}

// eslint-disable-next-line require-jsdoc
function errorMessage$1(message, target) {
  const description = getDescription(target);
  return `${message} when calling \`select('${description}')\`.`;
}

/**
  Set the `selected` property true for the provided option the target is a
  select element (or set the select property true for multiple options if the
  multiple attribute is set true on the HTMLSelectElement) then trigger
  `change` and `input` events on the specified target.

  @public
  @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor for the select element
  @param {string|string[]} options the value/values of the items to select
  @param {boolean} keepPreviouslySelected a flag keep any existing selections
  @return {Promise<void>} resolves when the application is settled

  @example
  <caption>
    Emulating selecting an option or multiple options using `select`
  </caption>

  select('select', 'apple');

  select('select', ['apple', 'orange']);

  select('select', ['apple', 'orange'], true);
*/
function select(target, options, keepPreviouslySelected = false) {
  return Promise.resolve().then(() => runHooks('select', 'start', target, options, keepPreviouslySelected)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `select`.');
    }
    if (typeof options === 'undefined' || options === null) {
      throw new Error('Must provide an `option` or `options` to select when calling `select`.');
    }
    const element = getElement(target);
    if (!element) {
      throw new Error(errorMessage$1('Element not found', target));
    }
    if (!isSelectElement(element)) {
      throw new Error(errorMessage$1('Element is not a HTMLSelectElement', target));
    }
    if (element.disabled) {
      throw new Error(errorMessage$1('Element is disabled', target));
    }
    options = Array.isArray(options) ? options : [options];
    if (!element.multiple && options.length > 1) {
      throw new Error(errorMessage$1('HTMLSelectElement `multiple` attribute is set to `false` but multiple options were passed', target));
    }
    return __focus__(element).then(() => element);
  }).then(element => {
    for (let i = 0; i < element.options.length; i++) {
      const elementOption = element.options.item(i);
      if (elementOption) {
        if (options.indexOf(elementOption.value) > -1) {
          elementOption.selected = true;
        } else if (!keepPreviouslySelected) {
          elementOption.selected = false;
        }
      }
    }
    return fireEvent(element, 'input').then(() => fireEvent(element, 'change')).then(settled);
  }).then(() => runHooks('select', 'end', target, options, keepPreviouslySelected));
}

/**
  Used internally by the DOM interaction helpers to find multiple elements.

  @private
  @param {string} target the selector to retrieve
  @returns {NodeList} the matched elements
*/
function getElements(target) {
  if (typeof target === 'string') {
    const rootElement = getRootElement();
    return rootElement.querySelectorAll(target);
  } else {
    const descriptorData = lookupDescriptorData(target);
    if (descriptorData) {
      return resolveDOMElements(descriptorData);
    } else {
      throw new Error('Must use a selector string or DOM element descriptor');
    }
  }
}

/**
  Used to wait for a particular selector to appear in the DOM. Due to the fact
  that it does not wait for general settledness, this is quite useful for testing
  interim DOM states (e.g. loading states, pending promises, etc).

  @param {string|IDOMElementDescriptor} target the selector or DOM element descriptor to wait for
  @param {Object} [options] the options to be used
  @param {number} [options.timeout=1000] the time to wait (in ms) for a match
  @param {number} [options.count=null] the number of elements that should match the provided selector (null means one or more)
  @return {Promise<Element|Element[]>} resolves when the element(s) appear on the page

  @example
  <caption>
    Waiting until a selector is rendered:
  </caption>
  await waitFor('.my-selector', { timeout: 2000 })
*/
function waitFor(target, options = {}) {
  return Promise.resolve().then(() => {
    if (typeof target !== 'string' && !lookupDescriptorData(target)) {
      throw new Error('Must pass a selector or DOM element descriptor to `waitFor`.');
    }
    const {
      timeout = 1000,
      count = null
    } = options;
    let {
      timeoutMessage
    } = options;
    if (!timeoutMessage) {
      const description = getDescription(target);
      timeoutMessage = `waitFor timed out waiting for selector "${description}"`;
    }
    let callback;
    if (count !== null) {
      callback = () => {
        const elements = Array.from(getElements(target));
        if (elements.length === count) {
          return elements;
        }
        return;
      };
    } else {
      callback = () => getElement(target);
    }
    return waitUntil(callback, {
      timeout,
      timeoutMessage
    });
  });
}

// Derived from `querySelector` types.

/**
  Find the first element matched by the given selector. Equivalent to calling
  `querySelector()` on the test root element.

  @public
  @param {string} selector the selector to search for
  @return {Element | null} matched element or null

  @example
  <caption>
    Finding the first element with id 'foo'
  </caption>
  find('#foo');
*/
function find(selector) {
  if (!selector) {
    throw new Error('Must pass a selector to `find`.');
  }
  if (arguments.length > 1) {
    throw new Error('The `find` test helper only takes a single argument.');
  }
  return getElement(selector);
}

// Derived, with modification, from the types for `querySelectorAll`. These
// would simply be defined as a tweaked re-export as `querySelector` is, but it
// is non-trivial (to say the least!) to preserve overloads like this while also
// changing the return type (from `NodeListOf` to `Array`).

/**
  Find all elements matched by the given selector. Similar to calling
  `querySelectorAll()` on the test root element, but returns an array instead
  of a `NodeList`.

  @public
  @param {string} selector the selector to search for
  @return {Array} array of matched elements

  @example
  <caption>
    Find all of the elements matching '.my-selector'.
  </caption>
  findAll('.my-selector');
*/
function findAll(selector) {
  if (!selector) {
    throw new Error('Must pass a selector to `findAll`.');
  }
  if (arguments.length > 1) {
    throw new Error('The `findAll` test helper only takes a single argument.');
  }
  return Array.from(getElements(selector));
}

registerHook('typeIn', 'start', (target, text) => {
  log('typeIn', target, text);
});

/**
 * Mimics character by character entry into the target `input` or `textarea` element.
 *
 * Allows for simulation of slow entry by passing an optional millisecond delay
 * between key events.

 * The major difference between `typeIn` and `fillIn` is that `typeIn` triggers
 * keyboard events as well as `input` and `change`.
 * Typically this looks like `focus` -> `focusin` -> `keydown` -> `keypress` -> `keyup` -> `input` -> `change`
 * per character of the passed text (this may vary on some browsers).
 *
 * @public
 * @param {string|Element|IDOMElementDescriptor} target the element, selector, or descriptor to enter text into
 * @param {string} text the test to fill the element with
 * @param {Object} options {delay: x} (default 50) number of milliseconds to wait per keypress
 * @return {Promise<void>} resolves when the application is settled
 *
 * @example
 * <caption>
 *   Emulating typing in an input using `typeIn`
 * </caption>
 *
 * typeIn('input', 'hello world');
 */
function typeIn(target, text, options = {}) {
  return Promise.resolve().then(() => {
    return runHooks('typeIn', 'start', target, text, options);
  }).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `typeIn`.');
    }
    const element = getElement(target);
    if (!element) {
      const description = getDescription(target);
      throw new Error(`Element not found when calling \`typeIn('${description}')\``);
    }
    if (isDocument(element) || !isFormControl(element) && !isContentEditable(element)) {
      throw new Error('`typeIn` is only usable on form controls or contenteditable elements.');
    }
    if (typeof text === 'undefined' || text === null) {
      throw new Error('Must provide `text` when calling `typeIn`.');
    }
    if (isFormControl(element)) {
      if (element.disabled) {
        throw new Error(`Can not \`typeIn\` disabled '${getDescription(target)}'.`);
      }
      if ('readOnly' in element && element.readOnly) {
        throw new Error(`Can not \`typeIn\` readonly '${getDescription(target)}'.`);
      }
    }
    const {
      delay = 50
    } = options;
    return __focus__(element).then(() => fillOut(element, text, delay)).then(() => fireEvent(element, 'change')).then(settled).then(() => runHooks('typeIn', 'end', target, text, options));
  });
}

// eslint-disable-next-line require-jsdoc
function fillOut(element, text, delay) {
  const inputFunctions = text.split('').map(character => keyEntry(element, character));
  return inputFunctions.reduce((currentPromise, func) => {
    return currentPromise.then(() => delayedExecute(delay)).then(func);
  }, Promise.resolve());
}

// eslint-disable-next-line require-jsdoc
function keyEntry(element, character) {
  const shiftKey = character === character.toUpperCase() && character !== character.toLowerCase();
  const options = {
    shiftKey
  };
  const characterKey = character.toUpperCase();
  return function () {
    return Promise.resolve().then(() => __triggerKeyEvent__(element, 'keydown', characterKey, options)).then(() => __triggerKeyEvent__(element, 'keypress', characterKey, options)).then(() => {
      if (isFormControl(element)) {
        const newValue = element.value + character;
        guardForMaxlength(element, newValue, 'typeIn');
        element.value = newValue;
      } else {
        const newValue = element.innerHTML + character;
        element.innerHTML = newValue;
      }
      return fireEvent(element, 'input');
    }).then(() => __triggerKeyEvent__(element, 'keyup', characterKey, options));
  };
}

// eslint-disable-next-line require-jsdoc
function delayedExecute(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

// eslint-disable-next-line require-jsdoc
function errorMessage(message, target) {
  const description = getDescription(target);
  return `${message} when calling \`scrollTo('${description}')\`.`;
}

/**
  Scrolls DOM element, selector, or descriptor to the given coordinates.
  @public
  @param {string|HTMLElement|IDOMElementDescriptor} target the element, selector, or descriptor to trigger scroll on
  @param {Number} x x-coordinate
  @param {Number} y y-coordinate
  @return {Promise<void>} resolves when settled

  @example
  <caption>
    Scroll DOM element to specific coordinates
  </caption>

  scrollTo('#my-long-div', 0, 0); // scroll to top
  scrollTo('#my-long-div', 0, 100); // scroll down
*/
function scrollTo(target, x, y) {
  return Promise.resolve().then(() => runHooks('scrollTo', 'start', target)).then(() => {
    if (!target) {
      throw new Error('Must pass an element, selector, or descriptor to `scrollTo`.');
    }
    if (x === undefined || y === undefined) {
      throw new Error('Must pass both x and y coordinates to `scrollTo`.');
    }
    const element = getElement(target);
    if (!element) {
      throw new Error(errorMessage('Element not found', target));
    }
    if (!isElement(element)) {
      let nodeType;
      if (isDocument(element)) {
        nodeType = 'Document';
      } else {
        // This is an error check for non-typescript callers passing in the
        // wrong type for `target`, so we have to cast `element` (which is
        // `never` inside this block) to something that will allow us to
        // access `nodeType`.
        const notElement = element;
        nodeType = notElement.nodeType;
      }
      throw new Error(errorMessage(`"target" must be an element, but was a ${nodeType}`, target));
    }
    element.scrollTop = y;
    element.scrollLeft = x;
    return fireEvent(element, 'scroll').then(settled);
  }).then(() => runHooks('scrollTo', 'end', target));
}

/**
  Used to wait for a particular selector to receive focus. Useful for verifying
  keyboard navigation handling and default focus behaviour, without having to
  think about timing issues.

  @param {string|IDOMElementDescriptor} target the selector or DOM element descriptor to wait receiving focus
  @param {Object} [options] the options to be used
  @param {number} [options.timeout=1000] the time to wait (in ms) for a match
  @param {string} [options.timeoutMessage='waitForFocus timed out waiting for selector'] the message to use in the reject on timeout
  @return {Promise<Element>} resolves when the element received focus

  @example
  <caption>
    Waiting until a selector receive focus:
  </caption>
  await waitForFocus('.my-selector', { timeout: 2000 })
*/
function waitForFocus(target, options = {}) {
  return Promise.resolve().then(() => {
    if (typeof target !== 'string' && !lookupDescriptorData(target)) {
      throw new Error('Must pass a selector or DOM element descriptor to `waitFor`.');
    }
    const {
      timeout = 1000
    } = options;
    let {
      timeoutMessage
    } = options;
    if (!timeoutMessage) {
      const description = getDescription(target);
      timeoutMessage = `waitForFocus timed out waiting for selector "${description}"`;
    }
    return waitUntil(() => {
      const element = getElement(target);
      if (element && element === document.activeElement) {
        return document.activeElement;
      }
    }, {
      timeout,
      timeoutMessage
    });
  });
}

export { blur, clearRender, click, doubleClick, fillIn, find, findAll, focus, getContext, getRootElement, getTestMetadata, registerHook, render, rerender, runHooks, scrollTo, select, settled, setupRenderingContext, triggerTab as tab, tap, teardownContext, triggerEvent, triggerKeyEvent, typeIn, unsetContext, validateErrorHandler, waitFor, waitForFocus, waitUntil };
//# sourceMappingURL=index.js.map
