import { module, test } from 'qunit';
import {
  setupContext,
  setupRenderingContext,
  teardownContext,
  render,
} from '@ember/test-helpers';
import { setResolverRegistry } from '../helpers/resolver';
import { hbs } from 'ember-cli-htmlbars';

module('setupRenderingContext | {{outlet}} helper', function (hooks) {
  hooks.beforeEach(async function () {
    setResolverRegistry({});

    await setupContext(this);
    await setupRenderingContext(this);
  });

  hooks.afterEach(async function () {
    await teardownContext(this);
  });

  test('render() renders a template containing {{outlet}}', async function (assert) {
    await render(hbs`<div class="layout">before{{outlet}}after</div>`);

    assert.dom('.layout').hasText('beforeafter');
  });
});
