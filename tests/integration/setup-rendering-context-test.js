import Ember from 'ember';
import { module, test } from 'qunit';
import Component from '@ember/component';
import { helper } from '@ember/component/helper';
import {
  setupContext,
  setupRenderingContext,
  teardownContext,
  waitFor,
  render,
  click,
} from '@ember/test-helpers';

import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { setResolverRegistry } from '../helpers/resolver';
import { hbs } from 'ember-cli-htmlbars';
import { precompileTemplate } from '@ember/template-compilation';
import { defer } from 'rsvp';

const PromiseWrapperTemplate = hbs`
{{~#if settled~}}
  {{fulfillmentValue}}
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
{{~#if wasClicked~}}
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
  if (!hasEmberVersion(2, 4)) {
    return;
  }
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

    // In Ember < 2.8 `registerWaiter` expected to be bound to
    // `Ember.Test` 😭
    //
    // Once we have dropped support for < 2.8 we should swap this to
    // use:
    //
    // import { registerWaiter } from '@ember/test';
    Ember.Test.registerWaiter(this._waiter);
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
      hbs`<div>{{#in-element rootElement insertBefore=null}}{{click-me-button}}{{/in-element}}</div>`
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
});
