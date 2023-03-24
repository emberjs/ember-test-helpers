import { module, test } from 'qunit';
import EmberRouter from '@ember/routing/router';
import Route from '@ember/routing/route';
import Service from '@ember/service';
import { Promise } from 'rsvp';
import {
  setupContext,
  setupApplicationContext,
  teardownContext,
  getTestMetadata,
  click,
  visit,
  currentRouteName,
  currentURL,
  registerHook,
  isSettled,
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { setResolverRegistry } from '../helpers/resolver';
import { hbs } from 'ember-cli-htmlbars';

const Router = EmberRouter.extend({ location: 'none' });
Router.map(function () {
  this.route('widgets');
  this.route('posts', function () {
    this.route('post', { path: ':post_id' });
  });
  this.route('links-to-slow');
  this.route('slow');
});

module('setupApplicationContext', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(async function () {
    let registry = {
      'router:main': Router,
      'template:application': hbs`
        <div class="nav"><LinkTo @route="posts">posts</LinkTo> | <LinkTo @route="widgets">widgets</LinkTo></div>
        {{outlet}}
      `,
      'template:index': hbs`<h1>Hello World!</h1>`,
      'template:links-to-slow': hbs`<LinkTo @route="slow" class="to-slow">to slow</LinkTo>`,
      'template:posts': hbs`<h1>Posts Page</h1>{{outlet}}`,
      'template:posts/post': hbs`<div class="post-id">{{this.model.post_id}}</div>`,
      'service:foo': Service.extend({ isFoo: true }),
      'route:posts/post': Route.extend({
        model(params) {
          return params;
        },
      }),
      'route:widgets': Route.extend({
        model() {
          throw new Error('Model hook error from /widgets');
        },
      }),
      'route:slow': Route.extend({
        model() {
          QUnit.config.current.assert.step('model start');
          return new Promise((resolve) => {
            setTimeout(() => {
              QUnit.config.current.assert.step('model resolving');
              resolve();
            }, 50);
          });
        },
      }),
    };

    if (!hasEmberVersion(3, 12)) {
      registry = {
        ...registry,
        // overrides for older Ember's
        'template:application': hbs`
            <div class="nav">{{#link-to "posts"}}posts{{/link-to}} | {{#link-to "widgets"}}widgets{{/link-to}}</div>
            {{outlet}}
          `,
        'template:links-to-slow': hbs`{{#link-to "slow" class="to-slow"}}to slow{{/link-to}}`,
        'template:posts/post': hbs`<div class="post-id">{{model.post_id}}</div>`,
      };
    }

    setResolverRegistry(registry);

    await setupContext(this);
    await setupApplicationContext(this);
  });

  hooks.afterEach(async function () {
    await teardownContext(this);
  });

  test('it sets up test metadata', function (assert) {
    let testMetadata = getTestMetadata(this);

    assert.deepEqual(testMetadata.setupTypes, [
      'setupContext',
      'setupApplicationContext',
    ]);
  });

  test('it executes registered visit hooks for start and end at the right time', async function (assert) {
    assert.expect(5);

    let hookStart = registerHook('visit', 'start', () => {
      assert.equal(currentURL(), null);
      assert.step('visit:start');
    });
    let hookEnd = registerHook('visit', 'end', () => {
      assert.equal(currentURL(), '/');
      assert.step('visit:end');
    });

    try {
      await visit('/');

      assert.verifySteps(['visit:start', 'visit:end']);
    } finally {
      hookStart.unregister();
      hookEnd.unregister();
    }
  });

  test('it returns true for isApplication in an application test', function (assert) {
    let testMetadata = getTestMetadata(this);

    assert.ok(testMetadata.isApplication);
  });

  test('can perform a basic template rendering', async function (assert) {
    await visit('/');

    assert.equal(currentRouteName(), 'index');
    assert.equal(currentURL(), '/');

    assert.equal(
      this.element.querySelector('.nav').textContent,
      'posts | widgets'
    );
    assert.equal(this.element.querySelector('h1').textContent, 'Hello World!');
  });

  test('is settled after a visit', async function (assert) {
    await visit('/');

    assert.ok(isSettled(), 'should be settled');
  });

  test('can perform a basic template rendering for nested route', async function (assert) {
    await visit('/posts/1');

    assert.equal(currentRouteName(), 'posts.post');
    assert.equal(currentURL(), '/posts/1');

    assert.equal(
      this.element.querySelector('.nav').textContent,
      'posts | widgets'
    );
    assert.equal(this.element.querySelector('.post-id').textContent, '1');
  });

  test('can visit multiple times', async function (assert) {
    await visit('/posts/1');

    assert.equal(currentRouteName(), 'posts.post');
    assert.equal(currentURL(), '/posts/1');

    assert.equal(
      this.element.querySelector('.nav').textContent,
      'posts | widgets'
    );
    assert.equal(this.element.querySelector('.post-id').textContent, '1');

    await visit('/');

    assert.equal(currentRouteName(), 'index');
    assert.equal(currentURL(), '/');

    assert.equal(
      this.element.querySelector('.nav').textContent,
      'posts | widgets'
    );
    assert.equal(this.element.querySelector('h1').textContent, 'Hello World!');

    await visit('/posts/2');

    assert.equal(currentRouteName(), 'posts.post');
    assert.equal(currentURL(), '/posts/2');

    assert.equal(
      this.element.querySelector('.nav').textContent,
      'posts | widgets'
    );
    assert.equal(this.element.querySelector('.post-id').textContent, '2');
  });

  test('can navigate amongst routes', async function (assert) {
    await visit('/');

    assert.equal(currentRouteName(), 'index');
    assert.equal(currentURL(), '/');

    await click('a[href="/posts"]');

    assert.equal(currentRouteName(), 'posts.index');
    assert.equal(currentURL(), '/posts');

    assert.equal(this.element.querySelector('h1').textContent, 'Posts Page');
  });

  test('bubbles up errors', function (assert) {
    assert.rejects(visit('/widgets'), /Model hook error from \/widgets/);
  });

  test('visit waits for async in model hooks', async function (assert) {
    assert.step('visiting');
    let visitPromise = visit('/slow');
    assert.step('after visit invocation');

    await visitPromise;

    assert.step('after visit resolved');

    assert.equal(currentRouteName(), 'slow');
    assert.equal(currentURL(), '/slow');

    assert.verifySteps([
      'visiting',
      'after visit invocation',
      'model start',
      'model resolving',
      'after visit resolved',
    ]);
  });

  test('settled waits for async in model hooks after a click', async function (assert) {
    await visit('/links-to-slow');

    assert.step('before click');
    let clickPromise = click('.to-slow');
    assert.step('after click');

    await clickPromise;

    assert.step('after click resolved');

    assert.equal(currentRouteName(), 'slow');
    assert.equal(currentURL(), '/slow');

    assert.verifySteps([
      'before click',
      'after click',
      'model start',
      'model resolving',
      'after click resolved',
    ]);
  });
});
