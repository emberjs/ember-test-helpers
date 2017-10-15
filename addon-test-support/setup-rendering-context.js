import { run, next } from '@ember/runloop';
import { Promise, resolve } from 'rsvp';
import Ember from 'ember';
import jQuery from 'jquery';

export default function(context) {
  let { owner } = context;

  let dispatcher =
    owner.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
  dispatcher.setup({}, '#ember-testing');

  let OutletView = owner.factoryFor
    ? owner.factoryFor('view:-outlet')
    : owner._lookupFactory('view:-outlet');
  let OutletTemplate = owner.lookup('template:-outlet');
  let toplevelView = OutletView.create(); // TODO: stash this somewhere?
  let hasOutletTemplate = !!OutletTemplate;
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

    return resolve().then(function asyncRenderSetup() {
      let templateFullName = 'template:-undertest-' + ++templateId;
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

      return new Promise(function asyncRender(resolve) {
        run.join(() => {
          toplevelView.setOutletState(outletState);
          if (!hasRendered) {
            // TODO: make this id configurable
            run(toplevelView, 'appendTo', '#ember-testing');
            hasRendered = true;
          }

          // ensure the element is based on the wrapping toplevel view
          // Ember still wraps the main application template with a
          // normal tagged view
          element = document.querySelector('#ember-testing > .ember-view');

          // using next here because the actual rendering does not happen until
          // the renderer detects it is dirty (which happens on backburner's end
          // hook), see the following implementation details:
          //
          // * [view:outlet](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/views/outlet.js#L129-L145) manually dirties its own tag upon `setOutletState`
          // * [backburner's custom end hook](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/renderer.js#L145-L159) detects that the current revision of the root is no longer the latest, and triggers a new rendering transaction

          // TODO: should we resolve with the element? might be nice
          // for easier assertions...
          next(resolve);
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

  if (jQuery) {
    context.$ = function $(selector) {
      // emulates Ember internal behavor of `this.$` in a component
      // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
      return selector ? jQuery(selector, element) : $(element);
    };
  }

  context.clearRender = function clearRender() {
    return new Promise(function async_clearRender(resolve) {
      run.join(function() {
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
}
