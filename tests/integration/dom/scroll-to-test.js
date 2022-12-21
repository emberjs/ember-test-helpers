import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import {
  render,
  scrollTo,
  setupContext,
  setupRenderingContext,
  teardownContext,
} from '@ember/test-helpers';
import {
  buildExpectedSteps,
  registerHooks,
  unregisterHooks,
} from '../../helpers/register-hooks';

module('DOM Helper: scroll-to', function (hooks) {
  hooks.beforeEach(async function () {
    await setupContext(this);
    await setupRenderingContext(this);
  });

  hooks.afterEach(async function () {
    await teardownContext(this);
  });

  test('it executes registered scrollTo hooks', async function (assert) {
    assert.expect(7);

    const expectedEvents = ['scroll'];
    const mockHooks = registerHooks(assert, 'scrollTo', { expectedEvents });

    await render(hbs`
      <div
        style="height: 200px; overflow-y: auto;"
        class="container"
      >
        <ul>
        <li class="item" style="height: 100px;">A</li>
        <li class="item" style="height: 100px;">B</li>
        <li class="item" style="height: 100px;">C</li>
        <li class="item" style="height: 100px;">D</li>
        <li class="item" style="height: 100px;">E</li>
        </ul>
      </div>
      `);

    try {
      await scrollTo('.container', 0, 50);

      const expectedSteps = buildExpectedSteps('scrollTo', { expectedEvents });
      assert.verifySteps(expectedSteps);
    } finally {
      unregisterHooks(mockHooks);
    }
  });

  test('Scroll in vertical direction', async function (assert) {
    assert.expect(1);

    let currentScrollPosition = 0;
    let scrollAmount = 50;
    this.callback = (e) => {
      currentScrollPosition = e.target.scrollTop;
    };

    await render(hbs`
      <div
        style="height: 200px; overflow-y: auto;"
        class="container"
        onscroll={{this.callback}}
      >
        <ul>
        <li class="item" style="height: 100px;">A</li>
        <li class="item" style="height: 100px;">B</li>
        <li class="item" style="height: 100px;">C</li>
        <li class="item" style="height: 100px;">D</li>
        <li class="item" style="height: 100px;">E</li>
        </ul>
      </div>
      `);

    await scrollTo('.container', 0, scrollAmount);

    assert.equal(
      currentScrollPosition,
      scrollAmount,
      'After use of the `scrollTop` a paint cycle is triggered and the callback is called'
    );
  });

  test('Scroll in horizontal direction', async function (assert) {
    let currentScrollPosition = 0;
    let scrollAmount = 50;
    this.callback = (e) => {
      currentScrollPosition = e.target.scrollLeft;
    };

    await render(hbs`
      <div
        style="width: 200px; overflow-x: auto; white-space: nowrap;"
        class="container"
        onscroll={{this.callback}}
      >
        <div class="item" style="width: 100px; height: 100px; display: inline-block">A</div>
        <div class="item" style="width: 100px; height: 100px; display: inline-block">B</div>
        <div class="item" style="width: 100px; height: 100px; display: inline-block">C</div>
        <div class="item" style="width: 100px; height: 100px; display: inline-block">D</div>
        <div class="item" style="width: 100px; height: 100px; display: inline-block">E</div>
      </div>
      `);

    await scrollTo('.container', scrollAmount, 0);

    assert.equal(
      currentScrollPosition,
      scrollAmount,
      'After use of the `scrollLeft` a paint cycle is triggered and the callback is called'
    );
  });

  test('It throws an error if a target is not supplied', async function (assert) {
    assert.rejects(
      scrollTo('', 0, 0),
      new Error('Must pass an element or selector to `scrollTo`.')
    );
  });

  test('It throws an error if all coordinates are not supplied', async function (assert) {
    await render(hbs`<div class="container"></div>`);

    assert.rejects(
      scrollTo('.container', 0),
      /Must pass both x and y coordinates/
    );
    assert.rejects(
      scrollTo('.container', undefined, 0),
      /Must pass both x and y coordinates/
    );
  });

  test('It throws an error if the target is not found', async function (assert) {
    await render(hbs`<div class="container"></div>`);

    assert.rejects(
      scrollTo('.container2', 0, 0),
      /Element not found when calling/
    );
  });

  test('It throws an error if the target is not an element', async function (assert) {
    assert.rejects(scrollTo(document, 0, 0), /"target" must be an element/);
    assert.rejects(scrollTo(window, 0, 0), /"target" must be an element/);
  });
});
