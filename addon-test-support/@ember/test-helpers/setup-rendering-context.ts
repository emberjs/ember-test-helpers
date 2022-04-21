/* globals EmberENV */
import { run } from '@ember/runloop';
import Ember from 'ember';
import global from './global';
import {
  BaseContext,
  TestContext,
  isTestContext,
  getContext,
} from './setup-context';
import { Promise } from './-utils';
import settled from './settled';
import { hbs, TemplateFactory } from 'ember-cli-htmlbars';
import getRootElement from './dom/get-root-element';
import { Owner } from './build-owner';
import getTestMetadata, { ITestMetadata } from './test-metadata';
import { assert, deprecate } from '@ember/debug';
import { runHooks } from './-internal/helper-hooks';
import hasEmberVersion from './has-ember-version';
import isComponent from './-internal/is-component';
import { macroCondition, dependencySatisfies } from '@embroider/macros';
import { ComponentRenderMap, SetUsage } from './setup-context';
import type { ComponentInstance } from '@glimmer/interfaces';

const OUTLET_TEMPLATE = hbs`{{outlet}}`;
const EMPTY_TEMPLATE = hbs``;
const INVOKE_PROVIDED_COMPONENT = hbs`<this.ProvidedComponent />`;
const DYNAMIC_INVOKE_PROVIDED_COMPONENT = hbs`{{component this.ProvidedComponent}}`;

export interface RenderingTestContext extends TestContext {
  render(template: TemplateFactory): Promise<void>;
  clearRender(): Promise<void>;

  $?(selector: string): any;

  element: Element | Document;
}

// eslint-disable-next-line require-jsdoc
export function isRenderingTestContext(
  context: BaseContext
): context is RenderingTestContext {
  return (
    isTestContext(context) &&
    typeof context.render === 'function' &&
    typeof context.clearRender === 'function'
  );
}

/**
  @private
  @param {Ember.ApplicationInstance} owner the current owner instance
  @param {string} templateFullName the fill template name
  @returns {Template} the template representing `templateFullName`
*/
function lookupTemplate(owner: Owner, templateFullName: string) {
  let template = owner.lookup(templateFullName);
  if (typeof template === 'function') return template(owner);
  return template;
}

/**
  @private
  @param {Ember.ApplicationInstance} owner the current owner instance
  @returns {Template} a template representing {{outlet}}
*/
function lookupOutletTemplate(owner: Owner): any {
  let OutletTemplate = lookupTemplate(owner, 'template:-outlet');
  if (!OutletTemplate) {
    owner.register('template:-outlet', OUTLET_TEMPLATE);
    OutletTemplate = lookupTemplate(owner, 'template:-outlet');
  }

  return OutletTemplate;
}

let templateId = 0;

export interface RenderOptions {
  /**
    The owner object to use as the basis for the template. In most cases you
    will not need to specify this, however if you are using ember-engines
    it is possible to specify the _engine's_ owner instead of the host
    applications.
  */
  owner?: Owner;
}

/**
  Renders the provided template and appends it to the DOM.

  @public
  @param {Template|Component} templateOrComponent the component (or template) to render
  @param {RenderOptions} options options hash containing engine owner ({ owner: engineOwner })
  @returns {Promise<void>} resolves when settled
*/
export function render(
  templateOrComponent: TemplateFactory | ComponentInstance,
  options?: RenderOptions
): Promise<void> {
  let context = getContext();

  if (!templateOrComponent) {
    throw new Error('you must pass a template to `render()`');
  }

  return Promise.resolve()
    .then(() => runHooks('render', 'start'))
    .then(() => {
      if (!context || !isRenderingTestContext(context)) {
        throw new Error(
          'Cannot call `render` without having first called `setupRenderingContext`.'
        );
      }

      let { owner } = context;
      let testMetadata = getTestMetadata(context);
      testMetadata.usedHelpers.push('render');

      let toplevelView = owner.lookup('-top-level-view:main');
      let OutletTemplate = lookupOutletTemplate(owner);
      let ownerToRenderFrom = options?.owner || owner;

      if (macroCondition(dependencySatisfies('ember-source', '<3.24.0'))) {
        // Pre 3.24, we just don't support rendering components at all, so we error
        // if we find anything that isn't a template.
        const isTemplate =
          ('__id' in templateOrComponent && '__meta' in templateOrComponent) ||
          ('id' in templateOrComponent && 'meta' in templateOrComponent);

        if (!isTemplate) {
          throw new Error(
            `Using \`render\` with something other than a pre-compiled template is not supported until Ember 3.24 (you are on ${Ember.VERSION}).`
          );
        }

        templateId += 1;
        let templateFullName = `template:-undertest-${templateId}`;
        ownerToRenderFrom.register(templateFullName, templateOrComponent);
        templateOrComponent = lookupTemplate(
          ownerToRenderFrom,
          templateFullName
        );
      } else {
        if (isComponent(templateOrComponent, owner)) {
          // We use this to track when `render` is used with a component so that we can throw an
          // assertion if `this.{set,setProperty} is used in the same test
          ComponentRenderMap.set(context, true);

          const setCalls = SetUsage.get(context);

          if (setCalls !== undefined) {
            assert(
              `You cannot call \`this.set\` or \`this.setProperties\` when passing a component to \`render\`, but they were called for the following properties:\n${setCalls
                .map((key) => `  - ${key}`)
                .join('\n')}`
            );
          }

          if (
            macroCondition(
              dependencySatisfies('ember-source', '>=3.25.0-beta.1')
            )
          ) {
            // In 3.25+, we can treat components as one big object and just pass them around/invoke them
            // wherever, so we just assign the component to the `ProvidedComponent` property and invoke it
            // in the test's template
            context = {
              ProvidedComponent: templateOrComponent,
            };
            templateOrComponent = INVOKE_PROVIDED_COMPONENT;
          } else {
            // Below 3.25, however, we *cannot* treat components as one big object and instead have to
            // register their class and template independently and then invoke them with the `component`
            // helper so they can actually be found by the resolver and rendered
            templateId += 1;
            let name = `-undertest-${templateId}`;
            let componentFullName = `component:${name}`;
            let templateFullName = `template:components/${name}`;
            context = {
              ProvidedComponent: name,
            };
            ownerToRenderFrom.register(componentFullName, templateOrComponent);
            templateOrComponent = DYNAMIC_INVOKE_PROVIDED_COMPONENT;
            ownerToRenderFrom.register(templateFullName, templateOrComponent);
          }
        } else {
          templateId += 1;
          let templateFullName = `template:-undertest-${templateId}`;
          ownerToRenderFrom.register(templateFullName, templateOrComponent);
          templateOrComponent = lookupTemplate(
            ownerToRenderFrom,
            templateFullName
          );
        }
      }

      let outletState = {
        render: {
          owner, // always use the host app owner for application outlet
          into: undefined,
          outlet: 'main',
          name: 'application',
          controller: undefined,
          ViewClass: undefined,
          template: OutletTemplate,
        },

        outlets: {
          main: {
            render: {
              owner: ownerToRenderFrom, // the actual owner to be used for any lookups
              into: undefined,
              outlet: 'main',
              name: 'index',
              controller: context,
              ViewClass: undefined,
              template: templateOrComponent,
              outlets: {},
            },
            outlets: {},
          },
        },
      };
      toplevelView.setOutletState(outletState);

      // Ember's rendering engine is integration with the run loop so that when a run
      // loop starts, the rendering is scheduled to be done.
      //
      // Ember should be ensuring an instance on its own here (the act of
      // setting outletState should ensureInstance, since we know we need to
      // render), but on Ember < 3.23 that is not guaranteed.
      if (!hasEmberVersion(3, 23)) {
        run.backburner.ensureInstance();
      }

      // returning settled here because the actual rendering does not happen until
      // the renderer detects it is dirty (which happens on backburner's end
      // hook), see the following implementation details:
      //
      // * [view:outlet](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/views/outlet.js#L129-L145) manually dirties its own tag upon `setOutletState`
      // * [backburner's custom end hook](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/renderer.js#L145-L159) detects that the current revision of the root is no longer the latest, and triggers a new rendering transaction
      return settled();
    })
    .then(() => runHooks('render', 'end'));
}

/**
  Clears any templates previously rendered. This is commonly used for
  confirming behavior that is triggered by teardown (e.g.
  `willDestroyElement`).

  @public
  @returns {Promise<void>} resolves when settled
*/
export function clearRender(): Promise<void> {
  let context = getContext();

  if (!context || !isRenderingTestContext(context)) {
    throw new Error(
      'Cannot call `clearRender` without having first called `setupRenderingContext`.'
    );
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
  @param {Object} context the context to setup for rendering
  @returns {Promise<Object>} resolves with the context that was setup
*/
export default function setupRenderingContext(
  context: TestContext
): Promise<RenderingTestContext> {
  let testMetadata: ITestMetadata = getTestMetadata(context);
  testMetadata.setupTypes.push('setupRenderingContext');

  return Promise.resolve()
    .then(() => {
      let { owner } = context;

      let renderDeprecationWrapper = function (template: TemplateFactory) {
        deprecate(
          'Using this.render has been deprecated, consider using `render` imported from `@ember/test-helpers`.',
          false,
          {
            id: 'ember-test-helpers.setup-rendering-context.render',
            until: '3.0.0',
            for: '@ember/test-helpers',
            since: {
              enabled: '2.0.0',
            },
          } as any // @types/ember is missing since + for
        );

        return render(template);
      };

      let clearRenderDeprecationWrapper = function () {
        deprecate(
          'Using this.clearRender has been deprecated, consider using `clearRender` imported from `@ember/test-helpers`.',
          false,
          {
            id: 'ember-test-helpers.setup-rendering-context.clearRender',
            until: '3.0.0',
            for: '@ember/test-helpers',
            since: {
              enabled: '2.0.0',
            },
          } as any // @types/ember is missing since + for
        );

        return clearRender();
      };

      Object.defineProperty(context, 'render', {
        configurable: true,
        enumerable: true,
        value: renderDeprecationWrapper,
        writable: false,
      });
      Object.defineProperty(context, 'clearRender', {
        configurable: true,
        enumerable: true,
        value: clearRenderDeprecationWrapper,
        writable: false,
      });

      // When the host app uses `setApplication` (instead of `setResolver`) the event dispatcher has
      // already been setup via `applicationInstance.boot()` in `./build-owner`. If using
      // `setResolver` (instead of `setApplication`) a "mock owner" is created by extending
      // `Ember._ContainerProxyMixin` and `Ember._RegistryProxyMixin` in this scenario we need to
      // manually start the event dispatcher.
      if (owner._emberTestHelpersMockOwner) {
        let dispatcher =
          owner.lookup('event_dispatcher:main') ||
          (Ember.EventDispatcher as any).create();
        dispatcher.setup({}, '#ember-testing');
      }

      let OutletView = owner.factoryFor
        ? owner.factoryFor('view:-outlet')
        : owner._lookupFactory!('view:-outlet');

      let environment = owner.lookup('-environment:main');
      let template = owner.lookup('template:-outlet');

      let toplevelView = OutletView.create({
        template,
        environment,
      });

      owner.register('-top-level-view:main', {
        create() {
          return toplevelView;
        },
      });

      // initially render a simple empty template
      return render(EMPTY_TEMPLATE).then(() => {
        (run as Function)(toplevelView, 'appendTo', getRootElement());

        return settled();
      });
    })
    .then(() => {
      Object.defineProperty(context, 'element', {
        configurable: true,
        enumerable: true,
        // ensure the element is based on the wrapping toplevel view
        // Ember still wraps the main application template with a
        // normal tagged view
        //
        // In older Ember versions (2.4) the element itself is not stable,
        // and therefore we cannot update the `this.element` until after the
        // rendering is completed
        value:
          global.EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false
            ? getRootElement().querySelector('.ember-view')
            : getRootElement(),

        writable: false,
      });

      return context as RenderingTestContext;
    });
}
