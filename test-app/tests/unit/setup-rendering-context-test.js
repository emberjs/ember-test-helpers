import { module, test } from 'qunit';
import Service from '@ember/service';
import Component, { setComponentTemplate } from '@ember/component';
import GlimmerComponent from '@glimmer/component';
import { helper } from '@ember/component/helper';
import {
  getApplication,
  setupContext,
  setupRenderingContext,
  teardownContext,
  registerHook,
  getTestMetadata,
  render,
  clearRender,
  setApplication,
  setResolver,
  triggerEvent,
  focus,
  blur,
  click,
  isSettled,
} from '@ember/test-helpers';
import {
  setResolverRegistry,
  application,
  resolver,
} from '../helpers/resolver';
import { hbs } from 'ember-cli-htmlbars';
import { getOwner } from '@ember/application';
import Engine from '@ember/engine';
import { precompileTemplate } from '@ember/template-compilation';
import templateOnly from '@ember/component/template-only';
import hasEmberVersion from '@ember/test-helpers/has-ember-version';

async function buildEngineOwner(parentOwner, registry) {
  parentOwner.register(
    'engine:foo',
    Engine.extend({
      router: null,

      Resolver: {
        create() {
          return {
            registry,
            resolve(fullName) {
              return registry[fullName];
            },
          };
        },
      },
    })
  );

  let instance = parentOwner.buildChildEngineInstance('foo', {
    routable: true,
    mountPoint: 'foo',
  });

  await instance.boot();

  return instance;
}

module('setupRenderingContext', function (hooks) {
  hooks.afterEach(function () {
    setApplication(application);
    setResolver(resolver);
  });

  function overwriteTest(key) {
    test(`throws an error when trying to overwrite this.${key}`, function (assert) {
      assert.throws(() => {
        this[key] = null;
      }, TypeError);
    });
  }

  function setupRenderingContextTests(hooks) {
    hooks.beforeEach(async function () {
      setResolverRegistry({
        'service:foo': Service.extend({ isFoo: true }),
        'component:template-only': setComponentTemplate(
          hbs`template-only component here`,
          class extends Component {}
        ),
        'component:js-only': Component.extend({
          classNames: ['js-only'],
        }),
        'component:outer-comp': setComponentTemplate(
          hbs`outer{{inner-comp}}outer`,
          class extends Component {}
        ),
        'component:inner-comp': setComponentTemplate(
          hbs`inner`,
          class extends Component {}
        ),
      });

      await setupContext(this);
      await setupRenderingContext(this);
    });

    hooks.afterEach(async function () {
      await teardownContext(this);
    });

    test('render works', async function (assert) {
      await render(hbs`Hi!`);

      assert.equal(this.element.textContent, 'Hi!');
    });

    test('render works with custom owner', async function (assert) {
      if (getApplication() === null) {
        assert.ok(
          true,
          'cannot test custom owner when no root application is set'
        );
        return;
      }

      let alternateOwner = await buildEngineOwner(this.owner, {
        'component:foo': setComponentTemplate(
          hbs`hello!`,
          class extends Component {}
        ),
      });

      this.owner.register(
        'component:foo',
        setComponentTemplate(hbs`noooooooo!`, class extends Component {})
      );

      await render(hbs`<Foo />`, { owner: alternateOwner });

      assert.equal(this.element.textContent, 'hello!');
    });

    test('render exposes an `.element` property', async function (assert) {
      let rootElement = document.getElementById('ember-testing');
      assert.equal(
        this.element,
        rootElement,
        'this.element should _be_ rootElement'
      );

      await render(hbs`<p>Hello!</p>`);

      assert.equal(this.element.textContent, 'Hello!');
    });

    test('is settled after rendering', async function (assert) {
      await render(hbs`Hi!`);

      assert.ok(isSettled(), 'should be settled');
    });

    overwriteTest('element');

    test('it sets up test metadata', function (assert) {
      let testMetadata = getTestMetadata(this);

      assert.deepEqual(testMetadata.setupTypes, [
        'setupContext',
        'setupRenderingContext',
      ]);
    });

    test('it returns true for isRendering in an rendering test', function (assert) {
      let testMetadata = getTestMetadata(this);

      assert.ok(testMetadata.isRendering);
    });

    test('it executes registered render hooks for start and end at the right time', async function (assert) {
      assert.expect(3);

      let hookStart = registerHook('render', 'start', () => {
        assert.step('render:start');
      });
      let hookEnd = registerHook('render', 'end', () => {
        assert.step('render:end');
      });

      try {
        await render(hbs`<p>Hello!</p>`);

        assert.verifySteps(['render:start', 'render:end']);
      } finally {
        hookStart.unregister();
        hookEnd.unregister();
      }
    });

    test('render can be used multiple times', async function (assert) {
      await render(hbs`<p>Hello!</p>`);
      assert.equal(this.element.textContent, 'Hello!');

      await render(hbs`<p>World!</p>`);
      assert.equal(this.element.textContent, 'World!');
    });

    test('foo', async function (assert) {
      const MyComponentTpl = hbs`<div class="my-component">Hello, {{@name}}</div>`;
      const MyComponent = setComponentTemplate(MyComponentTpl, class extends Component {});
      await render(MyComponent, {
        name: 'Tomster',
      });
      assert.equal(this.element.querySelector('.my-component').textContent, 'Hello, Tomster');
    });

    test('render does not run sync', async function (assert) {
      assert.ok(
        this.element,
        'precond - this.element is present (but empty) before render'
      );

      let renderPromise = render(hbs`<p>Hello!</p>`);

      assert.equal(
        this.element.textContent,
        '',
        'precond - this.element is not updated sync'
      );

      await renderPromise;

      assert.equal(this.element.textContent, 'Hello!');
    });

    test('clearRender can be used to clear the previously rendered template', async function (assert) {
      let testingRootElement = document.getElementById('ember-testing');
      let originalElement = this.element;

      await render(hbs`<p>Hello!</p>`);

      assert.equal(this.element.textContent, 'Hello!', 'has rendered content');
      assert.equal(
        testingRootElement.textContent,
        'Hello!',
        'has rendered content'
      );

      await clearRender();

      assert.equal(this.element.textContent, '', 'has rendered content');
      assert.equal(testingRootElement.textContent, '', 'has rendered content');
      assert.strictEqual(
        this.element,
        originalElement,
        'this.element is stable'
      );
    });

    test('is settled after clearRender', async function (assert) {
      await render(hbs`<p>Hello!</p>`);

      await clearRender();

      assert.ok(isSettled(), 'should be settled');
    });

    test('can invoke template only components', async function (assert) {
      await render(hbs`{{template-only}}`);

      assert.equal(this.element.textContent, 'template-only component here');
    });

    test('can invoke JS only components', async function (assert) {
      await render(hbs`{{js-only}}`);

      assert.ok(
        this.element.querySelector('.js-only'),
        'element found for js-only component'
      );
    });

    test('can invoke helper', async function (assert) {
      this.setProperties({
        jax: helper(([name]) => `${name}-jax`),
      });
      await render(hbs`{{this.jax "max"}}`);

      assert.equal(this.element.textContent, 'max-jax');
    });

    test('can pass arguments to helper from context', async function (assert) {
      this.setProperties({
        jax: helper(([name]) => `${name}-jax`),
      });
      this.set('name', 'james');

      await render(hbs`{{this.jax this.name}}`);

      assert.equal(this.element.textContent, 'james-jax');
    });

    test('can render a component that renders other components', async function (assert) {
      await render(hbs`{{outer-comp}}`);

      assert.equal(this.element.textContent, 'outerinnerouter');
    });

    test('can use the component helper in its layout', async function (assert) {
      this.owner.register(
        'component:x-foo',
        setComponentTemplate(hbs`x-foo here`, class extends Component {})
      );

      await render(hbs`{{component 'x-foo'}}`);

      assert.equal(this.element.textContent, 'x-foo here');
    });

    test('can create a component instance for direct testing without a template', function (assert) {
      this.owner.register(
        'component:foo-bar',
        Component.extend({
          someMethod() {
            return 'hello thar!';
          },
        })
      );

      let subject = this.owner.lookup('component:foo-bar');

      assert.equal(subject.someMethod(), 'hello thar!');
    });

    test('can handle a click event', async function (assert) {
      assert.expect(2);

      this.owner.register(
        'component:x-foo',
        setComponentTemplate(
          hbs`<button>Click me!</button>`,
          Component.extend({
            click() {
              assert.ok(true, 'click was fired');
            },
          })
        )
      );

      await render(hbs`{{x-foo}}`);

      assert.equal(
        this.element.textContent,
        'Click me!',
        'precond - component was rendered'
      );
      await click(this.element.querySelector('button'));
    });

    test('can use action based event handling', async function (assert) {
      assert.expect(2);

      this.owner.register(
        'component:x-foo',
        setComponentTemplate(
          hbs`<button {{on 'click' this.clicked}}>Click me!</button>`,

          class extends Component {
            clicked = () => {
              assert.ok(true, 'click was fired');
            };
          }
        )
      );

      await render(hbs`{{x-foo}}`);

      assert.equal(
        this.element.textContent,
        'Click me!',
        'precond - component was rendered'
      );
      await click(this.element.querySelector('button'));
    });

    test('can pass function to be used as a "closure action"', async function (assert) {
      assert.expect(2);

      this.owner.register(
        'component:x-foo',
        setComponentTemplate(
          hbs`<button {{on 'click' @clicked}}>Click me!</button>`,
          Component.extend()
        )
      );

      this.set('clicked', () => assert.ok(true, 'action was triggered'));
      await render(hbs`{{x-foo clicked=this.clicked}}`);

      assert.equal(
        this.element.textContent,
        'Click me!',
        'precond - component was rendered'
      );
      await click(this.element.querySelector('button'));
    });

    test('can pass function to be used as a "closure action" to a template only component', async function (assert) {
      assert.expect(2);

      let template = hbs`<button onclick={{@clicked}}>Click me!</button>`;

      this.owner.register(
        'component:x-foo',
        setComponentTemplate(template, class extends Component {})
      );

      this.set('clicked', () => assert.ok(true, 'action was triggered'));
      await render(hbs`{{x-foo clicked=this.clicked}}`);

      assert.equal(
        this.element.textContent,
        'Click me!',
        'precond - component was rendered'
      );
      await click(this.element.querySelector('button'));
    });

    test('can update a passed in argument with an <input>', async function (assert) {
      this.owner.register(
        'component:my-input',
        setComponentTemplate(
          hbs`{{input value=@value}}`,
          class extends Component {}
        )
      );

      await render(hbs`<MyInput @value={{this.value}} />`);

      let input = this.element.querySelector('input');

      assert.strictEqual(
        this.get('value'),
        undefined,
        'precond - property is initially null'
      );
      assert.equal(
        input.value,
        '',
        'precond - element value is initially empty'
      );

      // trigger the change
      input.value = '1';
      await triggerEvent(input, 'change');

      assert.equal(this.get('value'), '1');
    });

    test('it supports dom triggered focus events', async function (assert) {
      this.owner.register(
        'component:x-input',
        setComponentTemplate(
          hbs`<input onblur={{this.onBlur}} onfocusout={{this.onFocus}} />`,
          class extends Component {}
        )
      );
      await render(hbs`<XInput />`);

      let input = this.element.querySelector('input');
      function blurIt() {
        assert.step('blur');
      }
      function focusIt() {
        assert.step('focus');
      }
      input.addEventListener('blur', blurIt);

      input.addEventListener('focus', focusIt);

      await focus(input);
      await blur(input);

      assert.verifySteps(['focus', 'blur']);
      input.removeEventListener('blur', blurIt);
      input.removeEventListener('focus', focusIt);
    });

    test('two way bound arguments are updated', async function (assert) {
      this.owner.register(
        'component:my-component',
        setComponentTemplate(
          hbs`<button {{on 'click' this.clicked}}>{{this.foo}}</button>`,
          class extends Component {
            clicked = () => {
              this.set('foo', 'updated!');
            };
          }
        )
      );

      this.set('foo', 'original');
      await render(hbs`<MyComponent @foo={{this.foo}} />`);
      assert.equal(
        this.element.textContent,
        'original',
        'value after initial render'
      );

      await click(this.element.querySelector('button'));
      assert.equal(
        this.element.textContent,
        'updated!',
        'value after updating'
      );
      assert.equal(this.get('foo'), 'updated!');
    });

    test('two way bound arguments are available after clearRender is called', async function (assert) {
      this.owner.register(
        'component:my-component',
        setComponentTemplate(
          hbs`<button {{on 'click' this.clicked}}>{{this.foo}}</button>`,
          class extends Component {
            clicked = () => {
              this.set('foo', 'updated!');
              this.set('bar', 'updated bar!');
            };
          }
        )
      );

      // using two arguments here to ensure the two way binding
      // works both for things rendered in the component's layout
      // and those only used in the components JS file
      await render(hbs`<MyComponent @foo={{this.foo}} @bar={{this.bar}} />`);
      await click(this.element.querySelector('button'));

      await clearRender();

      assert.equal(this.get('foo'), 'updated!');
      assert.equal(this.get('bar'), 'updated bar!');
    });

    test('imported `render` can be used instead of render', async function (assert) {
      await render(hbs`yippie!!`);

      assert.equal(this.element.textContent, 'yippie!!');
    });

    test('context supports getOwner', async function (assert) {
      assert.equal(getOwner(this), this.owner);
    });

    if (hasEmberVersion(3, 25)) {
      // render tests for components in 3.25+ where we can use lexical scope
      module('using render with a component in Ember >= 3.25', function () {
        test('works with a template-only component', async function (assert) {
          const name = 'Chris';

          const template = precompileTemplate(
            '<p>hello my name is {{name}}</p>',
            {
              scope() {
                return {
                  name,
                };
              },
            }
          );
          const component = setComponentTemplate(template, templateOnly());
          await render(component);
          assert.equal(
            this.element.textContent,
            'hello my name is Chris',
            'has rendered content'
          );
        });

        test('works with a glimmer component', async function (assert) {
          const name = 'Chris';
          const template = precompileTemplate(
            '<p>hello my name is {{name}} and my favorite color is {{this.favoriteColor}}</p>',
            {
              scope() {
                return {
                  name,
                };
              },
            }
          );

          class Foo extends GlimmerComponent {
            favoriteColor = 'red';
          }

          setComponentTemplate(template, Foo);
          await render(Foo);

          assert.equal(
            this.element.textContent,
            'hello my name is Chris and my favorite color is red',
            'has rendered content'
          );
        });

        test('works with a classic component', async function (assert) {
          const name = 'Chris';
          const template = precompileTemplate(
            '<p>hello my name is {{name}} and my favorite color is {{this.favoriteColor}}</p>',
            {
              scope() {
                return {
                  name,
                };
              },
            }
          );

          const Foo = Component.extend({
            favoriteColor: 'red',
          });

          setComponentTemplate(template, Foo);
          await render(Foo);

          assert.equal(
            this.element.textContent,
            'hello my name is Chris and my favorite color is red',
            'has rendered content'
          );
        });

        test('components passed to render do *not* have access to the test context', async function (assert) {
          const template = precompileTemplate(
            'the value of foo is {{this.foo}}'
          );

          class Foo extends GlimmerComponent {
            foo = 'foo';
          }

          const component = setComponentTemplate(template, Foo);

          this.foo = 'bar';

          await render(component);

          assert.equal(this.element.textContent, 'the value of foo is foo');
        });

        test('setting properties on the test context when rendering a template does not throw an assertion', async function (assert) {
          const template = precompileTemplate(
            'the value of foo is {{this.foo}}'
          );

          this.set('foo', 'FOO');
          this.setProperties({
            foo: 'bar?',
          });

          await render(template);

          assert.true(true, 'no assertions are thrown');
        });
      });
    } else if (hasEmberVersion(3, 24)) {
      module('using render with a component in Ember < 3.25', function () {
        test('works with a template-only component', async function (assert) {
          const template = precompileTemplate(
            '<p>this is a template-only component with no dynamic content</p>'
          );
          const component = setComponentTemplate(template, templateOnly());
          await render(component);
          assert.equal(
            this.element.textContent,
            'this is a template-only component with no dynamic content',
            'has rendered content'
          );
        });

        test('works with a glimmer component', async function (assert) {
          const template = precompileTemplate(
            '<p>hello my favorite color is {{this.favoriteColor}}</p>'
          );

          class Foo extends GlimmerComponent {
            favoriteColor = 'red';
          }

          const component = setComponentTemplate(template, Foo);

          await render(component);
          assert.equal(
            this.element.textContent,
            'hello my favorite color is red',
            'has rendered content'
          );
        });

        test('works with a classic component', async function (assert) {
          const template = precompileTemplate(
            '<p>hello my favorite color is {{this.favoriteColor}}</p>'
          );

          const Foo = Component.extend({
            favoriteColor: 'red',
          });

          const component = setComponentTemplate(template, Foo);

          await render(component);

          assert.equal(
            this.element.textContent,
            'hello my favorite color is red',
            'has rendered content'
          );
        });

        test('components passed to render do *not* have access to the test context', async function (assert) {
          const template = precompileTemplate(
            'the value of foo is {{this.foo}}'
          );

          class Foo extends GlimmerComponent {
            foo = 'foo';
          }

          const component = setComponentTemplate(template, Foo);

          this.foo = 'bar';

          await render(component);

          assert.equal(this.element.textContent, 'the value of foo is foo');
        });

        test('setting properties on the test context when rendering a template does not throw an assertion', async function (assert) {
          const template = precompileTemplate(
            'the value of foo is {{this.foo}}'
          );

          this.set('foo', 'FOO');
          this.setProperties({
            foo: 'bar?',
          });

          await render(template);

          assert.true(true, 'no assertions are thrown');
        });
      });
    }
  }

  module('with only application set', function (hooks) {
    hooks.beforeEach(function () {
      setResolver(null);
      setApplication(application);
    });

    setupRenderingContextTests(hooks);
  });

  module('with application and resolver set', function (hooks) {
    hooks.beforeEach(function () {
      setResolver(resolver);
      setApplication(application);
    });

    setupRenderingContextTests(hooks);
  });

  module('with only resolver set', function (hooks) {
    hooks.beforeEach(function () {
      setResolver(resolver);
      setApplication(null);
    });

    setupRenderingContextTests(hooks);
  });
});
