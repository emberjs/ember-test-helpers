import { module, test, skip } from 'qunit';
import Service from '@ember/service';
import Component from '@ember/component';
import { helper } from '@ember/component/helper';
import {
  setupContext,
  setupRenderingContext,
  teardownContext,
  teardownRenderingContext,
} from 'ember-test-helpers';
import hasEmberVersion from 'ember-test-helpers/has-ember-version';
import hasjQuery from '../helpers/has-jquery';
import { setResolverRegistry } from '../helpers/resolver';
import hbs from 'htmlbars-inline-precompile';

module('setupRenderingContext', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(function() {
    setResolverRegistry({
      'service:foo': Service.extend({ isFoo: true }),
      'template:components/template-only': hbs`template-only component here`,
      'component:js-only': Component.extend({
        classNames: ['js-only'],
      }),
      'helper:jax': helper(([name]) => `${name}-jax`),
      'template:components/outer-comp': hbs`outer{{inner-comp}}outer`,
      'template:components/inner-comp': hbs`inner`,
    });

    setupContext(this);
    setupRenderingContext(this);
  });

  hooks.afterEach(function() {
    teardownContext(this);
    teardownRenderingContext(this);
  });

  test('render exposes an `.element` property', async function(assert) {
    await this.render(hbs`<p>Hello!</p>`);

    assert.equal(this.element.textContent, 'Hello!');
  });

  test('render can be used multiple times', async function(assert) {
    await this.render(hbs`<p>Hello!</p>`);
    assert.equal(this.element.textContent, 'Hello!');

    await this.render(hbs`<p>World!</p>`);
    assert.equal(this.element.textContent, 'World!');
  });

  test('render does not run sync', async function(assert) {
    assert.equal(this.element, undefined, 'precond - this.element is not set before this.render');

    let renderPromise = this.render(hbs`<p>Hello!</p>`);

    assert.equal(this.element, undefined, 'precond - this.element is not set sync');

    await renderPromise;
    assert.equal(this.element.textContent, 'Hello!');
  });

  test('clearRender can be used to clear the previously rendered template', async function(assert) {
    let testingRootElement = document.getElementById('ember-testing');

    await this.render(hbs`<p>Hello!</p>`);

    assert.equal(this.element.textContent, 'Hello!', 'has rendered content');
    assert.equal(testingRootElement.textContent, 'Hello!', 'has rendered content');

    await this.clearRender();
    assert.equal(this.element, undefined, 'this.element is reset');

    assert.equal(testingRootElement.textContent, '', 'content is cleared');
  });

  (hasjQuery() ? test : skip)('this.$ is exposed when jQuery is present', async function(assert) {
    await this.render(hbs`<p>Hello!</p>`);

    assert.equal(this.$().text(), 'Hello!');
  });

  test('can invoke template only components', async function(assert) {
    await this.render(hbs`{{template-only}}`);

    assert.equal(this.element.textContent, 'template-only component here');
  });

  test('can invoke JS only components', async function(assert) {
    await this.render(hbs`{{js-only}}`);

    assert.ok(this.element.querySelector('.js-only'), 'element found for js-only component');
  });

  test('can invoke helper', async function(assert) {
    await this.render(hbs`{{jax "max"}}`);

    assert.equal(this.element.textContent, 'max-jax');
  });

  test('can pass arguments to helper from context', async function(assert) {
    this.set('name', 'james');

    await this.render(hbs`{{jax name}}`);

    assert.equal(this.element.textContent, 'james-jax');
  });

  test('can render a component that renders other components', async function(assert) {
    await this.render(hbs`{{outer-comp}}`);

    assert.equal(this.element.textContent, 'outerinnerouter');
  });
});
