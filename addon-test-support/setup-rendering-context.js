import { guidFor } from '@ember/object/internals';
import { run, next } from '@ember/runloop';
import { Promise } from 'rsvp';
import Ember from 'ember';
import global from './global';
import { getContext } from './setup-context';

export const RENDERING_CLEANUP = Object.create(null);

export function render(template) {
  let context = getContext();

  if (!context || typeof context.render !== 'function') {
    throw new Error('Cannot call `render` without having first called `setupRenderingContext`.');
  }

  return context.render(template);
}

export function clearRender() {
  let context = getContext();

  if (!context || typeof context.clearRender !== 'function') {
    throw new Error(
      'Cannot call `clearRender` without having first called `setupRenderingContext`.'
    );
  }

  return context.clearRender();
}

/*
 * Responsible for:
 *
 * - Creating a basic rendering setup (e.g. setting up the main outlet view)
 * - Adding `this.render` to the provided context
 * - Adding `this.clearRender` to the provided context
 */
export default function(context) {
  let guid = guidFor(context);

  let testElementContainer = document.getElementById('ember-testing-container');
  let fixtureResetValue = testElementContainer.innerHTML;

  RENDERING_CLEANUP[guid] = [
    () => {
      testElementContainer.innerHTML = fixtureResetValue;
    },
  ];

  return new Promise(resolve => {
    // ensure "real" async and not "fake" RSVP based async
    next(() => {
      let { owner } = context;

      // When the host app uses `setApplication` (instead of `setResolver`) the event dispatcher has
      // already been setup via `applicationInstance.boot()` in `./build-owner`. If using
      // `setResolver` (instead of `setApplication`) a "mock owner" is created by extending
      // `Ember._ContainerProxyMixin` and `Ember._RegistryProxyMixin` in this scenario we need to
      // manually start the event dispatcher.
      if (owner._emberTestHelpersMockOwner) {
        let dispatcher = owner.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
        dispatcher.setup({}, '#ember-testing');
      }

      let OutletView = owner.factoryFor
        ? owner.factoryFor('view:-outlet')
        : owner._lookupFactory('view:-outlet');
      let OutletTemplate = owner.lookup('template:-outlet');
      let toplevelView = OutletView.create();
      RENDERING_CLEANUP[guid].push(() => toplevelView.destroy());

      let hasOutletTemplate = Boolean(OutletTemplate);
      let outletState = {
        render: {
          owner,
          into: undefined,
          outlet: 'main',
          name: 'application',
          controller: context,
          ViewClass: undefined,
          template: OutletTemplate,
        },

        outlets: {},
      };

      let element, hasRendered;
      let templateId = 0;

      if (hasOutletTemplate) {
        run(() => {
          toplevelView.setOutletState(outletState);
        });
      }

      context.render = function render(template) {
        if (!template) {
          throw new Error('you must pass a template to `render()`');
        }

        // ensure context.element is reset until after rendering has completed
        element = undefined;

        return new Promise(function asyncRender(resolve) {
          // manually enter async land, so that rendering itself is always async (even though
          // Ember <= 2.18 do not require async rendering)
          next(function asyncRenderSetup() {
            templateId += 1;
            let templateFullName = `template:-undertest-${templateId}`;
            owner.register(templateFullName, template);
            let stateToRender = {
              owner,
              into: undefined,
              outlet: 'main',
              name: 'index',
              controller: context,
              ViewClass: undefined,
              template: owner.lookup(templateFullName),
              outlets: {},
            };

            if (hasOutletTemplate) {
              stateToRender.name = 'index';
              outletState.outlets.main = { render: stateToRender, outlets: {} };
            } else {
              stateToRender.name = 'application';
              outletState = { render: stateToRender, outlets: {} };
            }

            toplevelView.setOutletState(outletState);
            if (!hasRendered) {
              // TODO: make this id configurable
              run(toplevelView, 'appendTo', '#ember-testing');
              hasRendered = true;
            }

            // using next here because the actual rendering does not happen until
            // the renderer detects it is dirty (which happens on backburner's end
            // hook), see the following implementation details:
            //
            // * [view:outlet](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/views/outlet.js#L129-L145) manually dirties its own tag upon `setOutletState`
            // * [backburner's custom end hook](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/renderer.js#L145-L159) detects that the current revision of the root is no longer the latest, and triggers a new rendering transaction
            next(function asyncUpdateElementAfterRender() {
              // ensure the element is based on the wrapping toplevel view
              // Ember still wraps the main application template with a
              // normal tagged view
              //
              // In older Ember versions (2.4) the element itself is not stable,
              // and therefore we cannot update the `this.element` until after the
              // rendering is completed
              element = document.querySelector('#ember-testing > .ember-view');

              resolve();
            });
          });
        });
      };

      Object.defineProperty(context, 'element', {
        enumerable: true,
        configurable: true,
        get() {
          return element;
        },
      });

      if (global.jQuery) {
        context.$ = function $(selector) {
          // emulates Ember internal behavor of `this.$` in a component
          // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
          return selector ? global.jQuery(selector, element) : global.jQuery(element);
        };
      }

      context.clearRender = function clearRender() {
        return new Promise(function async_clearRender(resolve) {
          element = undefined;

          next(function async_clearRender() {
            toplevelView.setOutletState({
              render: {
                owner,
                into: undefined,
                outlet: 'main',
                name: 'application',
                controller: context,
                ViewClass: undefined,
                template: undefined,
              },
              outlets: {},
            });

            // RE: next usage, see detailed comment above
            next(resolve);
          });
        });
      };

      resolve(context);
    });
  });
}
