import {
  macroCondition,
  importSync,
  appEmberSatisfies,
} from '@embroider/macros';

type RendererModule = typeof import('@ember/renderer');

let renderComponent: RendererModule['renderComponent'] | undefined;

/**
 * while renderComponent landed in ember-source @ 6.8.0-alpha.1,
 *  it was not fully usable (in serious) until 6.12.0-alpha.4
 *  when https://github.com/emberjs/ember.js/pull/20996 was merged.
 */
if (macroCondition(appEmberSatisfies('>=6.12.0-alpha.4'))) {
  renderComponent = (importSync('@ember/renderer') as RendererModule)
    .renderComponent;
}

export default renderComponent;
