/* globals EmberENV */
import { run } from '@ember/runloop';
import Ember from 'ember';
import global from './global';
import { isTestContext, getContext } from './setup-context';
import settled from './settled';
import { hbs } from 'ember-cli-htmlbars';
import getRootElement from './dom/get-root-element';
import getTestMetadata from './test-metadata';
import { assert } from '@ember/debug';
import { runHooks } from './helper-hooks';
import hasEmberVersion from './has-ember-version';
import isComponent from './-internal/is-component';
import { ComponentRenderMap, SetUsage } from './setup-context';
const OUTLET_TEMPLATE = hbs`{{outlet}}`;
const EMPTY_TEMPLATE = hbs``;
const INVOKE_PROVIDED_COMPONENT = hbs`<this.ProvidedComponent />`;
const hasCalledSetupRenderingContext = Symbol();
//  Isolates the notion of transforming a TextContext into a RenderingTestContext.
// eslint-disable-next-line require-jsdoc
function prepare(context) {
  let renderingTestContext = context;
  context[hasCalledSetupRenderingContext] = true;
  return context;
}

// eslint-disable-next-line require-jsdoc
export function isRenderingTestContext(context) {
  return isTestContext(context) && hasCalledSetupRenderingContext in context;
}

/**
  @private
  @param {Ember.ApplicationInstance} owner the current owner instance
  @param {string} templateFullName the fill template name
  @returns {Template} the template representing `templateFullName`
*/
function lookupTemplate(owner, templateFullName) {
  let template = owner.lookup(templateFullName);
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
export function render(templateFactoryOrComponent, options) {
  let context = getContext();
  if (!templateFactoryOrComponent) {
    throw new Error('you must pass a template to `render()`');
  }
  return Promise.resolve().then(() => runHooks('render', 'start')).then(() => {
    if (!context || !isRenderingTestContext(context)) {
      throw new Error('Cannot call `render` without having first called `setupRenderingContext`.');
    }
    let {
      owner
    } = context;
    let testMetadata = getTestMetadata(context);
    testMetadata.usedHelpers.push('render');

    // SAFETY: this is all wildly unsafe, because it is all using private API.
    // At some point we should define a path forward for this kind of internal
    // API. For now, just flagging it as *NOT* being safe!
    let toplevelView = owner.lookup('-top-level-view:main');
    let OutletTemplate = lookupOutletTemplate(owner);
    let ownerToRenderFrom = options?.owner || owner;
    if (isComponent(templateFactoryOrComponent)) {
      // We use this to track when `render` is used with a component so that we can throw an
      // assertion if `this.{set,setProperty} is used in the same test
      ComponentRenderMap.set(context, true);
      const setCalls = SetUsage.get(context);
      if (setCalls !== undefined) {
        assert(`You cannot call \`this.set\` or \`this.setProperties\` when passing a component to \`render\`, but they were called for the following properties:\n${setCalls.map(key => `  - ${key}`).join('\n')}`);
      }
      context = {
        ProvidedComponent: templateFactoryOrComponent
      };
      templateFactoryOrComponent = INVOKE_PROVIDED_COMPONENT;
    }
    templateId += 1;
    let templateFullName = `template:-undertest-${templateId}`;
    ownerToRenderFrom.register(templateFullName, templateFactoryOrComponent);
    let template = lookupTemplate(ownerToRenderFrom, templateFullName);
    let outletState = {
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
            controller: context,
            ViewClass: undefined,
            template,
            outlets: {}
          },
          outlets: {}
        }
      }
    };
    toplevelView.setOutletState(outletState);

    // Ember's rendering engine is integration with the run loop so that when a run
    // loop starts, the rendering is scheduled to be done.
    //
    // Ember should be ensuring an instance on its own here (the act of
    // setting outletState should ensureInstance, since we know we need to
    // render), but on Ember < 3.23 that is not guaranteed.
    if (!hasEmberVersion(3, 23)) {
      // SAFETY: this was correct and type checked on the Ember v3 types, but
      // since the `run` namespace does not exist in Ember v4, this no longer
      // can be type checked. When (eventually) dropping support for Ember v3,
      // and therefore for versions before 3.23, this can be removed entirely.
      run.backburner.ensureInstance();
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
export function clearRender() {
  let context = getContext();
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
export default function setupRenderingContext(context) {
  let testMetadata = getTestMetadata(context);
  testMetadata.setupTypes.push('setupRenderingContext');
  let renderingContext = prepare(context);
  return Promise.resolve().then(() => {
    let {
      owner
    } = renderingContext;

    // When the host app uses `setApplication` (instead of `setResolver`) the event dispatcher has
    // already been setup via `applicationInstance.boot()` in `./build-owner`. If using
    // `setResolver` (instead of `setApplication`) a "mock owner" is created by extending
    // `Ember._ContainerProxyMixin` and `Ember._RegistryProxyMixin` in this scenario we need to
    // manually start the event dispatcher.
    if (owner._emberTestHelpersMockOwner) {
      let dispatcher = owner.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
      dispatcher.setup({}, '#ember-testing');
    }
    let OutletView = owner.factoryFor ? owner.factoryFor('view:-outlet') : owner._lookupFactory('view:-outlet');
    let environment = owner.lookup('-environment:main');
    let template = owner.lookup('template:-outlet');
    let toplevelView = OutletView.create({
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
      // ensure the element is based on the wrapping toplevel view
      // Ember still wraps the main application template with a
      // normal tagged view
      //
      // In older Ember versions (2.4) the element itself is not stable,
      // and therefore we cannot update the `this.element` until after the
      // rendering is completed
      value: global.EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false ? getRootElement().querySelector('.ember-view') : getRootElement(),
      writable: false
    });
    return renderingContext;
  });
}