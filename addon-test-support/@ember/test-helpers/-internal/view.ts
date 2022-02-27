/**
 * @internal
 */
type Owner = {};

/**
 * @internal
 * @see {@link https://github.com/glimmerjs/glimmer-vm/blob/v0.84.0/packages/@glimmer/interfaces/lib/template.d.ts#L29-L55}
 */
type Template = {};

/**
 * @internal
 * @see {@link https://github.com/glimmerjs/glimmer-vm/blob/v0.84.0/packages/@glimmer/interfaces/lib/template.d.ts#L57}
 */
type TemplateFactory = (owner?: Owner) => Template;

/**
 * @internal
 * @see {@link https://github.com/emberjs/ember.js/blob/v4.4.0-alpha.3/packages/%40ember/-internals/glimmer/lib/utils/outlet.ts#L4-L41}
 */
export interface RenderState {
  /**
   * Not sure why this is here, we use the owner of the template for lookups.
   *
   * Maybe this is for the render helper?
   */
  owner: Owner;

  /**
   * The name of the parent outlet state.
   */
  into: string | undefined;

  /*
   * The outlet name in the parent outlet state's outlets.
   */
  outlet: string;

  /**
   * The name of the route/template
   */
  name: string;

  /**
   * The controller (the self of the outlet component)
   */
  controller: unknown;

  /**
   * The model (the resolved value of the model hook)
   */
  model: unknown;

  /**
   * template (the layout of the outlet component)
   */
  template: Template | TemplateFactory | undefined;
}

/**
 * @internal
 * @see {@link https://github.com/emberjs/ember.js/blob/v4.4.0-alpha.3/packages/%40ember/-internals/glimmer/lib/utils/outlet.ts#L43-L45}
 */
export interface Outlets {
  [name: string]: OutletState | undefined;
}

/**
 * @internal
 * @see {@link https://github.com/emberjs/ember.js/blob/v4.4.0-alpha.3/packages/%40ember/-internals/glimmer/lib/utils/outlet.ts#L47-L63}
 */
export interface OutletState {
  /**
   * Nested outlet connections.
   */
  outlets: Outlets;

  /**
   * Represents what was rendered into this outlet.
   */
  render: RenderState | undefined;

  /**
   * Has to do with render helper and orphan outlets.
   * Whether outlet state was rendered.
   */
  wasUsed?: boolean;
}

/**
 * @internal
 */
export interface OutletView {
  /**
   * @internal
   * @see {@link https://github.com/emberjs/ember.js/blob/v4.4.0-alpha.3/packages/%40ember/-internals/glimmer/lib/views/outlet.ts#L110-L112}
   */
  setOutletState(outletState: OutletState): void;
}
