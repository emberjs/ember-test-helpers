import { type BaseContext, type TestContext } from './setup-context.ts';
import type { Owner } from './build-owner.ts';
declare const hasCalledSetupRenderingContext: unique symbol;
export interface RenderingTestContext extends TestContext {
    element: Element | Document;
    [hasCalledSetupRenderingContext]?: true;
}
export declare function isRenderingTestContext(context: BaseContext): context is RenderingTestContext;
export interface RenderOptions {
    /**
      The owner object to use as the basis for the template. In most cases you
      will not need to specify this, however if you are using ember-engines
      it is possible to specify the _engine's_ owner instead of the host
      applications.
    */
    owner?: Owner;
}
/**
  Renders the provided template and appends it to the DOM.

  @public
  @param {Template|Component} templateFactoryOrComponent the component (or template) to render
  @param {RenderOptions} options options hash containing engine owner ({ owner: engineOwner })
  @returns {Promise<void>} resolves when settled

  @example
  <caption>
    Render a div element with the class 'container'.
  </caption>
  await render(hbs`<div class="container"></div>`);
*/
export declare function render(templateFactoryOrComponent: object, options?: RenderOptions): Promise<void>;
/**
  Clears any templates previously rendered. This is commonly used for
  confirming behavior that is triggered by teardown (e.g.
  `willDestroyElement`).

  @public
  @returns {Promise<void>} resolves when settled
*/
export declare function clearRender(): Promise<void>;
/**
  Used by test framework addons to setup the provided context for rendering.

  `setupContext` must have been ran on the provided context
  prior to calling `setupRenderingContext`.

  Responsible for:

  - Setup the basic framework used for rendering by the
    `render` helper.
  - Ensuring the event dispatcher is properly setup.
  - Setting `this.element` to the root element of the testing
    container (things rendered via `render` will go _into_ this
    element).

  @public
  @param {TestContext} context the context to setup for rendering
  @returns {Promise<RenderingTestContext>} resolves with the context that was setup

  @example
  <caption>
    Rendering out a paragraph element containing the content 'hello', and then clearing that content via clearRender.
  </caption>

  await render(hbs`<p>Hello!</p>`);
  assert.equal(this.element.textContent, 'Hello!', 'has rendered content');
  await clearRender();
  assert.equal(this.element.textContent, '', 'has rendered content');
*/
export default function setupRenderingContext(context: TestContext): Promise<RenderingTestContext>;
export {};
//# sourceMappingURL=setup-rendering-context.d.ts.map