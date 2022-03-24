import Ember from 'ember';
import { module, test } from 'qunit';
import Component, { setComponentTemplate } from '@ember/component';
import GlimmerComponent from '@glimmer/component';
import { helper } from '@ember/component/helper';
import { registerWaiter } from '@ember/test';
import {
  setupContext,
  setupRenderingContext,
  teardownContext,
  waitFor,
  render,
  rerender,
  click,
} from '@ember/test-helpers';
import templateOnly from '@ember/component/template-only';

import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { setResolverRegistry } from '../helpers/resolver';
import { hbs } from 'ember-cli-htmlbars';
import { precompileTemplate } from '@ember/template-compilation';
import { defer } from 'rsvp';
import { tracked } from '@glimmer/tracking';

const PromiseWrapperTemplate = hbs`
{{~#if this.settled~}}
  {{this.fulfillmentValue}}
{{~else~}}
  <div class="loading">Please wait</div>
{{~/if}}
`;

const PromiseWrapper = Component.extend({
  init() {
    this._super(...arguments);

    this.promise
      .then((value) => this.set('fulfillmentValue', value))
      .finally(() => this.set('settled', true));
  },
});

const ClickMeButtonTemplate = hbs`
{{~#if this.wasClicked~}}
  Clicked!
{{~else~}}
  Click Me!
{{~/if~}}
`;

const ClickMeButtonComponent = Component.extend({
  classNames: ['click-me-button'],
  init() {
    this._super(...arguments);
    this.wasClicked = false;
  },

  click() {
    this.set('wasClicked', true);
  },
});

module('setupRenderingContext "real world"', function (hooks) {
  hooks.beforeEach(async function () {
    setResolverRegistry({
      'component:promise-wrapper': PromiseWrapper,
      'template:components/promise-wrapper': PromiseWrapperTemplate,

      'component:click-me-button': ClickMeButtonComponent,
      'template:components/click-me-button': ClickMeButtonTemplate,
    });

    await setupContext(this);
    await setupRenderingContext(this);

    this._waiter = () => {
      return !this.isWaiterPending;
    };

    registerWaiter(this._waiter);
  });

  hooks.afterEach(async function () {
    Ember.Test.unregisterWaiter(this._waiter);
    await teardownContext(this);
  });

  test('can check element while waiting for settled state', async function (assert) {
    let deferred = defer();
    this.set('promise', deferred.promise);

    // force the waiter to pause, emulating a pending AJAX or fetch request
    this.isWaiterPending = true;

    // Does not use `await` intentionally
    let renderPromise = render(hbs`{{promise-wrapper promise=this.promise}}`);

    await waitFor('.loading');

    assert.equal(
      this.element.textContent,
      'Please wait',
      'has pending content'
    );

    deferred.resolve('Yippie!');

    // release the waiter, so `settled` from `render` will complete
    this.isWaiterPending = false;

    await renderPromise;

    assert.equal(this.element.textContent, 'Yippie!', 'has fulfillment value');
  });

  test('can click on a sibling of the rendered content', async function (assert) {
    let rootElement = document.getElementById('ember-testing');
    this.set('rootElement', rootElement);

    assert.equal(
      rootElement.textContent,
      '',
      'the rootElement is empty before rendering'
    );

    await render(
      hbs`<div>{{#in-element this.rootElement insertBefore=null}}{{click-me-button}}{{/in-element}}</div>`
    );

    assert.equal(
      rootElement.textContent,
      'Click Me!',
      'the rootElement has the correct content after initial render'
    );

    await click('.click-me-button');

    assert.equal(
      rootElement.textContent,
      'Clicked!',
      'the rootElement has the correct content after clicking'
    );
  });

  module('lexical scope access', function () {
    if (hasEmberVersion(3, 28)) {
      test('can render components passed as locals', async function (assert) {
        let add = helper(function ([first, second]) {
          return first + second;
        });

        await render(
          precompileTemplate('{{add 1 3}}', {
            scope() {
              return { add };
            },
          })
        );

        assert.equal(this.element.textContent, '4');
      });
    }
  });

  module('render with a component', function () {
    if (hasEmberVersion(3, 25)) {
      test('can render locally defined components', async function (assert) {
        class MyComponent extends GlimmerComponent {}

        setComponentTemplate(hbs`my name is {{@name}}`, MyComponent);

        const somePerson = new (class {
          @tracked name = 'Zoey';
        })();

        const template = precompileTemplate(
          '<MyComponent @name={{somePerson.name}} />',
          {
            scope() {
              return {
                somePerson,
                MyComponent,
              };
            },
          }
        );

        const component = setComponentTemplate(template, templateOnly());

        await render(component);

        assert.equal(this.element.textContent, 'my name is Zoey');

        somePerson.name = 'Tomster';

        await rerender();

        assert.equal(this.element.textContent, 'my name is Tomster');
      });
    }
  });
});
