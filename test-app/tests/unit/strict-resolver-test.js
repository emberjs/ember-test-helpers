import { module, test } from 'qunit';
import Service from '@ember/service';
import ApplicationInstance from '@ember/application/instance';
import {
  render,
  setApplication,
  setResolver,
  setupContext,
  setupRenderingContext,
  teardownContext,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import StrictApplication from 'ember-strict-application-resolver';
import { StrictResolver } from 'ember-strict-application-resolver/strict-resolver';
import { application, resolver } from '../helpers/resolver';

module('strict resolver', function (hooks) {
  const modules = {
    './services/foo': {
      default: class extends Service {
        isFoo = true;
      },
    },
  };

  let context;

  hooks.afterEach(async function () {
    if (context) {
      await teardownContext(context);
      context = undefined;
    }

    setApplication(application);
    setResolver(resolver);
  });

  function strictResolverTests() {
    test('the owner is an ApplicationInstance that resolves from the modules', async function (assert) {
      context = {};
      await setupContext(context);

      assert.true(context.owner instanceof ApplicationInstance);
      assert.true(context.owner.lookup('service:foo').isFoo);
    });

    test('render works', async function (assert) {
      context = {};
      await setupContext(context);
      await setupRenderingContext(context);

      await render(hbs`<p>rendered</p>`);

      assert.strictEqual(context.element.textContent, 'rendered');
    });
  }

  module('with only a StrictResolver set', function (hooks) {
    hooks.beforeEach(function () {
      setApplication(null);
      setResolver(new StrictResolver(modules));
    });

    strictResolverTests();
  });

  module('with a StrictResolver in the resolver option', function () {
    test('the owner resolves from the modules', async function (assert) {
      context = {};
      await setupContext(context, { resolver: new StrictResolver(modules) });

      assert.true(context.owner instanceof ApplicationInstance);
      assert.true(context.owner.lookup('service:foo').isFoo);
    });
  });

  module('with a strict application set', function (hooks) {
    let strictApplication;

    hooks.beforeEach(function () {
      class App extends StrictApplication {
        modules = modules;
      }

      strictApplication = App.create({
        autoboot: false,
        rootElement: '#ember-testing',
      });

      setResolver(null);
      setApplication(strictApplication);
    });

    hooks.afterEach(function () {
      strictApplication.destroy();
    });

    strictResolverTests();
  });
});
