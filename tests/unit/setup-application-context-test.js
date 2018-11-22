import { module, test } from 'qunit';
import EmberRouter from '@ember/routing/router';
import Route from '@ember/routing/route';
import Service from '@ember/service';
import {
  setupContext,
  setupApplicationContext,
  teardownContext,
  teardownApplicationContext,
  setApplication,
  click,
  visit,
  currentRouteName,
  currentURL,
  setResolver,
} from '@ember/test-helpers';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import { setResolverRegistry } from '../helpers/resolver';
import hbs from 'htmlbars-inline-precompile';
import { assign } from '@ember/polyfills';
import App from '../../app';
import config from '../../config/environment';

const Router = EmberRouter.extend({ location: 'none' });
Router.map(function() {
  this.route('widgets');
  this.route('posts', function() {
    this.route('post', { path: ':post_id' });
  });
});

module('setupApplicationContext', function(hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }
  let isolatedApp;
  hooks.beforeEach(async function() {
    const AppConfig = assign({ autoboot: false }, config.APP);
    // .extend() because initializers are stored in the constructor, and we
    // don't want to pollute other tests using an application created from the
    // same constructor.
    isolatedApp = App.extend({}).create(AppConfig);
    let resolver = isolatedApp.Resolver.create({
      namespace: isolatedApp,
      isResolverFromTestHelpers: true,
    });

    setResolver(resolver);
    setApplication(isolatedApp);

    setResolverRegistry({
      'router:main': Router,
      'template:application': hbs`
        <div class="nav">{{link-to 'posts' 'posts'}} | {{link-to 'widgets' 'widgets'}}</div>
        {{outlet}}
      `,
      'template:index': hbs`<h1>Hello World!</h1>`,
      'template:posts': hbs`<h1>Posts Page</h1>{{outlet}}`,
      'template:posts/post': hbs`<div class="post-id">{{model.post_id}}</div>`,
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
    });

    await setupContext(this);
    await setupApplicationContext(this);
  });

  hooks.afterEach(async function() {
    await teardownApplicationContext(this);
    await teardownContext(this);
  });

  test('can perform a basic template rendering', async function(assert) {
    await visit('/');

    assert.equal(currentRouteName(), 'index');
    assert.equal(currentURL(), '/');

    assert.equal(this.element.querySelector('.nav').textContent, 'posts | widgets');
    assert.equal(this.element.querySelector('h1').textContent, 'Hello World!');
  });

  test('can perform a basic template rendering for nested route', async function(assert) {
    await visit('/posts/1');

    assert.equal(currentRouteName(), 'posts.post');
    assert.equal(currentURL(), '/posts/1');

    assert.equal(this.element.querySelector('.nav').textContent, 'posts | widgets');
    assert.equal(this.element.querySelector('.post-id').textContent, '1');
  });

  test('can visit multiple times', async function(assert) {
    await visit('/posts/1');

    assert.equal(currentRouteName(), 'posts.post');
    assert.equal(currentURL(), '/posts/1');

    assert.equal(this.element.querySelector('.nav').textContent, 'posts | widgets');
    assert.equal(this.element.querySelector('.post-id').textContent, '1');

    await visit('/');

    assert.equal(currentRouteName(), 'index');
    assert.equal(currentURL(), '/');

    assert.equal(this.element.querySelector('.nav').textContent, 'posts | widgets');
    assert.equal(this.element.querySelector('h1').textContent, 'Hello World!');

    await visit('/posts/2');

    assert.equal(currentRouteName(), 'posts.post');
    assert.equal(currentURL(), '/posts/2');

    assert.equal(this.element.querySelector('.nav').textContent, 'posts | widgets');
    assert.equal(this.element.querySelector('.post-id').textContent, '2');
  });

  test('can navigate amongst routes', async function(assert) {
    await visit('/');

    assert.equal(currentRouteName(), 'index');
    assert.equal(currentURL(), '/');

    await click('a[href="/posts"]');

    assert.equal(currentRouteName(), 'posts.index');
    assert.equal(currentURL(), '/posts');

    assert.equal(this.element.querySelector('h1').textContent, 'Posts Page');
  });

  test('bubbles up errors', function(assert) {
    assert.rejects(visit('/widgets'), /Model hook error from \/widgets/);
  });
});
