import { module, test } from 'qunit';
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

  test('render exposes an `.element` property', function(assert) {
    return this.render(hbs`<p>Hello!</p>`).then(() => {
      assert.equal(this.element.textContent, 'Hello!');
    });
  });

  test('render can be used multiple times', function(assert) {
    return this.render(hbs`<p>Hello!</p>`)
      .then(() => {
        assert.equal(this.element.textContent, 'Hello!');

        return this.render(hbs`<p>World!</p>`);
      })
      .then(() => {
        assert.equal(this.element.textContent, 'World!');
      });
  });

  test('render does not run sync', function(assert) {
    assert.equal(
      this.element,
      undefined,
      'precond - this.element is not set before this.render'
    );

    let renderPromise = this.render(hbs`<p>Hello!</p>`).then(() => {
      assert.equal(this.element.textContent, 'Hello!');
    });

    assert.equal(
      this.element,
      undefined,
      'precond - this.element is not set sync after this.render'
    );

    return renderPromise.then(() => {
      assert.equal(this.element.textContent, 'Hello!');
    });
  });

  test('clearRender can be used to clear the previously rendered template', function(
    assert
  ) {
    let testingRootElement = document.getElementById('ember-testing');

    return this.render(hbs`<p>Hello!</p>`)
      .then(() => {
        assert.equal(
          this.element.textContent,
          'Hello!',
          'has rendered content'
        );
        assert.equal(
          testingRootElement.textContent,
          'Hello!',
          'has rendered content'
        );

        return this.clearRender();
      })
      .then(() => {
        assert.equal(this.element, undefined, 'this.element is reset');

        let testingRootElement = document.getElementById('ember-testing');
        assert.equal(testingRootElement.textContent, '', 'content is cleared');
      });
  });

  if (hasjQuery()) {
    test('this.$ is exposed when jQuery is present', function(assert) {
      return this.render(hbs`<p>Hello!</p>`).then(() => {
        assert.equal(this.$().text(), 'Hello!');
      });
    });
  }

  test('can invoke template only components', function(assert) {
    return this.render(hbs`{{template-only}}`).then(() => {
      assert.equal(this.element.textContent, 'template-only component here');
    });
  });

  test('can invoke JS only components', function(assert) {
    return this.render(hbs`{{js-only}}`).then(() => {
      assert.ok(
        this.element.querySelector('.js-only'),
        'element found for js-only component'
      );
    });
  });

  test('can invoke helper', function(assert) {
    return this.render(hbs`{{jax "max"}}`).then(() => {
      assert.equal(this.element.textContent, 'max-jax');
    });
  });

  test('can pass arguments to helper from context', function(assert) {
    this.set('name', 'james');

    return this.render(hbs`{{jax name}}`).then(() => {
      assert.equal(this.element.textContent, 'james-jax');
    });
  });

  test('can render a component that renders other components', function(
    assert
  ) {
    return this.render(hbs`{{outer-comp}}`).then(() => {
      assert.equal(this.element.textContent, 'outerinnerouter');
    });
  });
});
