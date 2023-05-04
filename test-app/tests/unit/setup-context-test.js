import { module, test } from 'qunit';
import Service, { inject as injectService } from '@ember/service';
import {
  setupContext,
  teardownContext,
  getContext,
  pauseTest,
  resumeTest,
  getDeprecations,
  getDeprecationsDuringCallback,
  getWarnings,
  getWarningsDuringCallback,
  setApplication,
  setResolver,
  getTestMetadata,
  settled,
} from '@ember/test-helpers';
import { getDeprecationsForContext } from '@ember/test-helpers/-internal/deprecations';
import { getWarningsForContext } from '@ember/test-helpers/-internal/warnings';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';
import {
  setResolverRegistry,
  createCustomResolver,
  application,
  resolver,
} from '../helpers/resolver';
import App from '../../app';
import config from '../../config/environment';
import Ember from 'ember';
import { deprecate, warn } from '@ember/debug';

module('setupContext', function (hooks) {
  if (!hasEmberVersion(2, 4)) {
    return;
  }

  hooks.beforeEach(function () {
    setResolverRegistry({
      'service:foo': Service.extend({ isFoo: true }),
    });
  });

  let context;
  hooks.afterEach(async function () {
    if (context) {
      await teardownContext(context);
      context = undefined;
    }

    setApplication(application);
    setResolver(resolver);
  });

  function overwriteTest(context, key) {
    test(`throws an error when trying to overwrite this.${key}`, function (assert) {
      assert.throws(() => {
        context[key] = null;
      }, TypeError);
    });
  }

  function setupContextTests() {
    module('without options', function (hooks) {
      hooks.beforeEach(function () {
        context = {};
        return setupContext(context);
      });

      test('it sets up this.owner', function (assert) {
        let { owner } = context;
        assert.ok(owner, 'owner was setup');
        assert.equal(
          typeof owner.lookup,
          'function',
          'has expected lookup interface'
        );

        if (hasEmberVersion(2, 12)) {
          assert.equal(
            typeof owner.factoryFor,
            'function',
            'has expected factory interface'
          );
        }
      });

      overwriteTest(context, 'owner');

      test('it uses the default resolver if no override specified', function (assert) {
        let { owner } = context;
        let instance = owner.lookup('service:foo');
        assert.equal(instance.isFoo, true, 'uses the default resolver');
      });

      test('it sets up this.set', function (assert) {
        context.set('foo', 'bar');
        assert.equal(context.foo, 'bar', 'this.set sets the property');
      });

      test('it sets up this.setProperties', function (assert) {
        context.setProperties({
          foo: 'bar',
          baz: 'qux',
        });

        assert.equal(
          context.foo,
          'bar',
          'this.setProperties sets the first property'
        );
        assert.equal(
          context.baz,
          'qux',
          'this.setProperties sets the second property'
        );
      });

      test('it sets up this.get', function (assert) {
        context.set('foo', 'bar');

        assert.equal(
          context.get('foo'),
          'bar',
          'this.get can read previously set property'
        );
      });

      test('it sets up this.getProperties', function (assert) {
        context.setProperties({
          foo: 'bar',
          baz: 'qux',
        });

        let result = context.getProperties('foo', 'baz');
        assert.deepEqual(
          result,
          {
            foo: 'bar',
            baz: 'qux',
          },
          'getProperties reads content from context'
        );
      });

      overwriteTest(context, 'set');
      overwriteTest(context, 'setProperties');
      overwriteTest(context, 'get');
      overwriteTest(context, 'getProperties');

      test('it calls setContext with the provided context', function (assert) {
        assert.equal(getContext(), context);
      });

      test('it sets up test metadata', function (assert) {
        let testMetadata = getTestMetadata(context);

        assert.deepEqual(testMetadata.setupTypes, ['setupContext']);
      });

      test('it returns false for isRendering/isApplication in non-rendering/application tests', function (assert) {
        let testMetadata = getTestMetadata(this);

        assert.ok(!testMetadata.isRendering);
        assert.ok(!testMetadata.isApplication);
      });

      test('can be used for unit style testing', function (assert) {
        context.owner.register(
          'service:foo',
          Service.extend({
            someMethod() {
              return 'hello thar!';
            },
          })
        );

        let subject = context.owner.lookup('service:foo');

        assert.equal(subject.someMethod(), 'hello thar!');
      });

      test('can access a service instance (instead of this.inject.service("thing") in 0.6)', function (assert) {
        context.owner.register('service:bar', Service.extend());
        context.owner.register(
          'service:foo',
          Service.extend({
            bar: injectService(),
            someMethod() {
              this.set('bar.someProp', 'derp');
            },
          })
        );

        let subject = context.owner.lookup('service:foo');
        let bar = context.owner.lookup('service:bar');

        assert.notOk(bar.get('someProp'), 'precond - initially undefined');

        subject.someMethod();

        assert.equal(bar.get('someProp'), 'derp', 'property updated');
      });

      module('warnings', function () {
        test('getWarningForContext', function (assert) {
          assert.throws(
            () => getWarningsForContext(),
            /could not get warnings for an invalid test context: 'undefined'/
          );
          assert.throws(
            () => getWarningsForContext(undefined),
            /could not get warnings for an invalid test context: 'undefined'/
          );
          assert.throws(
            () => getWarningsForContext(null),
            /could not get warnings for an invalid test context: 'null'/
          );
          assert.throws(
            () => getWarningsForContext(false),
            /could not get warnings for an invalid test context: 'false'/
          );
          assert.throws(
            () => getWarningsForContext(0),
            /could not get warnings for an invalid test context: '0'/
          );

          const contextA = {};
          const contextB = {};
          const contextC = {};

          assert.deepEqual(getWarningsForContext(contextA), []);
          assert.deepEqual(getWarningsForContext(contextB), []);
          assert.deepEqual(getWarningsForContext(contextC), []);

          assert.equal(
            getWarningsForContext(contextA),
            getWarningsForContext(contextA)
          );
          assert.equal(
            getWarningsForContext(contextB),
            getWarningsForContext(contextB)
          );
          assert.equal(
            getWarningsForContext(contextC),
            getWarningsForContext(contextC)
          );
        });

        test('getApplication leak test 0', function (assert) {
          assert.deepEqual(getWarnings(), []);
        });

        test('getWarnings', function (assert) {
          assert.deepEqual(getWarnings(), []);

          warn('warning.0', true, { id: 'ember-test-helpers.warn.test' });
          warn('warning.1', false, { id: 'ember-test-helpers.warn.test' });
          warn('warning.2', false, { id: 'ember-test-helpers.warn.test' });

          assert.deepEqual(getWarnings(), [
            {
              message: 'warning.1',
              options: { id: 'ember-test-helpers.warn.test' },
            },
            {
              message: 'warning.2',
              options: { id: 'ember-test-helpers.warn.test' },
            },
          ]);
        });

        test('getApplication leak test 0', function (assert) {
          assert.deepEqual(getWarnings(), []);
        });

        test('getWarningForCallback async', async function (assert) {
          warn('warning.0', false, { id: 'ember-test-helpers.warn.test' });

          assert.deepEqual(
            await getWarningsDuringCallback(async () => {
              await Promise.resolve();
              assert.deepEqual(getWarnings(), [
                {
                  message: 'warning.0',
                  options: { id: 'ember-test-helpers.warn.test' },
                },
              ]);
            }),
            []
          );

          assert.deepEqual(getWarnings(), [
            {
              message: 'warning.0',
              options: { id: 'ember-test-helpers.warn.test' },
            },
          ]);

          assert.deepEqual(
            await getWarningsDuringCallback(async () => {
              await Promise.resolve();
              warn('warning.1', false, { id: 'ember-test-helpers.warn.test' });
              assert.deepEqual(getWarnings(), [
                {
                  message: 'warning.0',
                  options: { id: 'ember-test-helpers.warn.test' },
                },
                {
                  message: 'warning.1',
                  options: { id: 'ember-test-helpers.warn.test' },
                },
              ]);
            }),
            [
              {
                message: 'warning.1',
                options: { id: 'ember-test-helpers.warn.test' },
              },
            ]
          );
        });
      });

      module('deprecations', function () {
        test('getDeprecationsForContext', function (assert) {
          assert.throws(
            () => getDeprecationsForContext(),
            /could not get deprecations for an invalid test context: 'undefined'/
          );
          assert.throws(
            () => getDeprecationsForContext(undefined),
            /could not get deprecations for an invalid test context: 'undefined'/
          );
          assert.throws(
            () => getDeprecationsForContext(null),
            /could not get deprecations for an invalid test context: 'null'/
          );
          assert.throws(
            () => getDeprecationsForContext(false),
            /could not get deprecations for an invalid test context: 'false'/
          );
          assert.throws(
            () => getDeprecationsForContext(0),
            /could not get deprecations for an invalid test context: '0'/
          );

          const contextA = {};
          const contextB = {};
          const contextC = {};

          assert.deepEqual(getDeprecationsForContext(contextA), []);
          assert.deepEqual(getDeprecationsForContext(contextB), []);
          assert.deepEqual(getDeprecationsForContext(contextC), []);

          assert.equal(
            getDeprecationsForContext(contextA),
            getDeprecationsForContext(contextA)
          );
          assert.equal(
            getDeprecationsForContext(contextB),
            getDeprecationsForContext(contextB)
          );
          assert.equal(
            getDeprecationsForContext(contextC),
            getDeprecationsForContext(contextC)
          );
        });

        test('getApplication leak test 0', function (assert) {
          assert.deepEqual(getDeprecations(), []);
        });

        test('getDeprecations', function (assert) {
          assert.deepEqual(getDeprecations(), []);

          deprecate('name.0', true, {
            for: 'testing',
            id: 'id.0',
            since: {
              available: '0',
            },
            until: '9999',
          });

          assert.deepEqual(getDeprecations(), []);

          deprecate('name.1', false, {
            for: 'testing',
            id: 'id.1',
            since: {
              available: '0',
            },
            until: '9999',
          });

          assert.deepEqual(getDeprecations(), [
            {
              message: 'name.1',
              options: {
                for: 'testing',
                id: 'id.1',
                since: {
                  available: '0',
                },
                until: '9999',
              },
            },
          ]);
        });

        test('getApplication leak test 0', function (assert) {
          assert.deepEqual(getDeprecations(), []);
        });

        test('getDeprecationsDuringCallback async', async function (assert) {
          deprecate('name.0', false, {
            for: 'testing',
            id: 'id.0',
            since: {
              available: '0',
            },
            until: '9999',
          });

          assert.deepEqual(
            await getDeprecationsDuringCallback(async () => {
              await Promise.resolve();

              assert.deepEqual(getDeprecations(), [
                {
                  message: 'name.0',
                  options: {
                    for: 'testing',
                    id: 'id.0',
                    since: {
                      available: '0',
                    },
                    until: '9999',
                  },
                },
              ]);
            }),
            []
          );

          assert.deepEqual(
            await getDeprecationsDuringCallback(async () => {
              await Promise.resolve();
              deprecate('name.1', false, {
                for: 'testing',
                id: 'id.1',
                since: {
                  available: '0',
                },
                until: '9999',
              });

              assert.deepEqual(getDeprecations(), [
                {
                  message: 'name.0',
                  options: {
                    for: 'testing',
                    id: 'id.0',
                    since: {
                      available: '0',
                    },
                    until: '9999',
                  },
                },

                {
                  message: 'name.1',
                  options: {
                    for: 'testing',
                    id: 'id.1',
                    since: {
                      available: '0',
                    },
                    until: '9999',
                  },
                },
              ]);
            }),
            [
              {
                message: 'name.1',
                options: {
                  for: 'testing',
                  id: 'id.1',
                  since: {
                    available: '0',
                  },
                  until: '9999',
                },
              },
            ]
          );
        });

        test('getDeprecationsDuringCallback', function (assert) {
          deprecate('name.0', false, {
            for: 'testing',
            id: 'id.0',
            since: {
              available: '0',
            },
            until: '9999',
          });

          assert.deepEqual(getDeprecations(), [
            {
              message: 'name.0',
              options: {
                for: 'testing',
                id: 'id.0',
                since: {
                  available: '0',
                },
                until: '9999',
              },
            },
          ]);

          assert.deepEqual(
            getDeprecationsDuringCallback(() => {
              assert.deepEqual(getDeprecations(), [
                {
                  message: 'name.0',
                  options: {
                    for: 'testing',
                    id: 'id.0',
                    since: {
                      available: '0',
                    },
                    until: '9999',
                  },
                },
              ]);
            }),
            []
          );

          assert.deepEqual(
            getDeprecationsDuringCallback(() => {
              assert.deepEqual(getDeprecations(), [
                {
                  message: 'name.0',
                  options: {
                    for: 'testing',
                    id: 'id.0',
                    since: {
                      available: '0',
                    },
                    until: '9999',
                  },
                },
              ]);

              deprecate('name.1', false, {
                for: 'testing',
                id: 'id.1',
                since: {
                  available: '0',
                },
                until: '9999',
              });

              assert.deepEqual(getDeprecations(), [
                {
                  message: 'name.0',
                  options: {
                    for: 'testing',
                    id: 'id.0',
                    since: {
                      available: '0',
                    },
                    until: '9999',
                  },
                },

                {
                  message: 'name.1',
                  options: {
                    for: 'testing',
                    id: 'id.1',
                    since: {
                      available: '0',
                    },
                    until: '9999',
                  },
                },
              ]);

              assert.deepEqual(
                getDeprecationsDuringCallback(() => {
                  assert.deepEqual(getDeprecations(), [
                    {
                      message: 'name.0',
                      options: {
                        for: 'testing',
                        id: 'id.0',
                        since: {
                          available: '0',
                        },
                        until: '9999',
                      },
                    },

                    {
                      message: 'name.1',
                      options: {
                        for: 'testing',
                        id: 'id.1',
                        since: {
                          available: '0',
                        },
                        until: '9999',
                      },
                    },
                  ]);

                  deprecate('name.3', false, {
                    for: 'testing',
                    id: 'id.3',
                    since: {
                      available: '0',
                    },
                    until: '9999',
                  });
                }),
                [
                  {
                    message: 'name.3',
                    options: {
                      for: 'testing',
                      id: 'id.3',
                      since: {
                        available: '0',
                      },
                      until: '9999',
                    },
                  },
                ]
              );
            }),
            [
              {
                message: 'name.1',
                options: {
                  for: 'testing',
                  id: 'id.1',
                  since: {
                    available: '0',
                  },
                  until: '9999',
                },
              },

              {
                message: 'name.3',
                options: {
                  for: 'testing',
                  id: 'id.3',
                  since: {
                    available: '0',
                  },
                  until: '9999',
                },
              },
            ]
          );

          assert.deepEqual(getDeprecations(), [
            {
              message: 'name.0',
              options: {
                for: 'testing',
                id: 'id.0',
                since: {
                  available: '0',
                },
                until: '9999',
              },
            },

            {
              message: 'name.1',
              options: {
                for: 'testing',
                id: 'id.1',
                since: {
                  available: '0',
                },
                until: '9999',
              },
            },

            {
              message: 'name.3',
              options: {
                for: 'testing',
                id: 'id.3',
                since: {
                  available: '0',
                },
                until: '9999',
              },
            },
          ]);
        });
      });

      test('can pauseTest to be resumed "later"', async function (assert) {
        assert.expect(5);

        let promise = context.pauseTest();

        // do some random things while "paused"
        setTimeout(function () {
          assert.step('5 ms');
        }, 5);

        setTimeout(function () {
          assert.step('20 ms');
        }, 20);

        setTimeout(function () {
          assert.step('30 ms');
        }, 30);

        setTimeout(function () {
          assert.step('50 ms');
          context.resumeTest();
        }, 50);

        await promise;

        assert.verifySteps(['5 ms', '20 ms', '30 ms', '50 ms']);
      });

      test('imported pauseTest and resumeTest allow customizations by test frameworks', async function (assert) {
        assert.expect(2);

        let originalPauseTest = context.pauseTest;
        context.pauseTest = () => {
          assert.ok(true, 'contexts pauseTest was called');
          return originalPauseTest();
        };

        let originalResumeTest = context.resumeTest;
        context.resumeTest = () => {
          assert.ok(true, 'customized resumeTest was called');
          return originalResumeTest();
        };

        let promise = pauseTest();

        resumeTest();

        await promise;
      });

      test('pauseTest sets up a window.resumeTest to easily resume', async function (assert) {
        assert.equal(
          window.resumeTest,
          undefined,
          'precond - starts out as undefined'
        );

        let promise = context.pauseTest();

        assert.equal(
          resumeTest,
          window.resumeTest,
          'window.resumeTest is the same as this.resumeTest'
        );

        context.resumeTest();

        assert.equal(
          window.resumeTest,
          undefined,
          'window.resumeTest is cleared after invocation'
        );

        await promise;
      });
    });

    module('with custom options', function () {
      test('it can specify a custom resolver', async function (assert) {
        context = {};
        let resolver = createCustomResolver({
          'service:foo': Service.extend({ isFoo: 'maybe?' }),
        });
        await setupContext(context, { resolver });
        let { owner } = context;
        let instance = owner.lookup('service:foo');
        assert.equal(instance.isFoo, 'maybe?', 'uses the custom resolver');
      });
    });

    test('Ember.testing', async function (assert) {
      assert.notOk(
        Ember.testing,
        'precond - Ember.testing is falsey before setup'
      );

      context = {};
      let promise = setupContext(context);

      assert.ok(Ember.testing, 'Ember.testing is truthy sync after setup');

      await promise;

      assert.ok(Ember.testing, 'Ember.testing is truthy async after setup');
    });
  }

  module('with only application set', function (hooks) {
    hooks.beforeEach(function () {
      setResolver(null);
      setApplication(application);
    });

    setupContextTests();
  });

  module('with application and resolver set', function (hooks) {
    hooks.beforeEach(function () {
      setResolver(resolver);
      setApplication(application);
    });

    setupContextTests();
  });

  module('with only resolver set', function (hooks) {
    hooks.beforeEach(function () {
      setResolver(resolver);
      setApplication(null);
    });

    setupContextTests();
  });

  module('initializers', function (hooks) {
    let isolatedApp;

    hooks.beforeEach(function () {
      const AppConfig = Object.assign({ autoboot: false }, config.APP);
      // .extend() because initializers are stored in the constructor, and we
      // don't want to pollute other tests using an application created from the
      // same constructor.
      isolatedApp = class extends App {}.create(AppConfig);
      let resolver = isolatedApp.Resolver.create({
        namespace: isolatedApp,
        isResolverFromTestHelpers: true,
      });

      setResolver(resolver);
      setApplication(isolatedApp);
    });

    hooks.afterEach(async function () {
      isolatedApp.destroy();
      await settled();
    });

    test('run once per test run', async function (assert) {
      let initializerCallCount = 0;
      isolatedApp.initializer({
        name: 'foo',
        initialize() {
          initializerCallCount += 1;
        },
      });

      await teardownContext(await setupContext({}));
      assert.equal(initializerCallCount, 1);

      await teardownContext(await setupContext({}));
      assert.equal(initializerCallCount, 1);
    });

    test('changes to the DOM persist across multiple setupContext() calls', async function (assert) {
      function rootEl() {
        return document.querySelector(isolatedApp.rootElement);
      }

      isolatedApp.initializer({
        name: 'foo',
        initialize() {
          let initializerDiv = document.createElement('div');
          initializerDiv.id = 'initializer';
          rootEl().appendChild(initializerDiv);
        },
      });

      try {
        let context = await setupContext({});
        try {
          assert.ok(rootEl().lastChild);
          assert.equal(rootEl().lastChild.id, 'initializer');
        } finally {
          await teardownContext(context);
        }

        context = await setupContext({});
        try {
          assert.ok(rootEl().lastChild);
          assert.equal(rootEl().lastChild.id, 'initializer');
        } finally {
          await teardownContext(context);
        }
      } finally {
        let lastChild = rootEl().lastChild;
        // Don't leave #ember-testing polluted for other tests
        if (lastChild) {
          rootEl().removeChild(lastChild);
        }
      }
    });
  });
});
