import {
  macroCondition,
  importSync,
  appEmberSatisfies,
} from '@embroider/macros';

type RendererModule = typeof import('@ember/renderer');

let renderComponent: RendererModule['renderComponent'] | undefined;

if (macroCondition(appEmberSatisfies('>=6.8.0-alpha.1'))) {
  renderComponent = (importSync('@ember/renderer') as RendererModule)
    .renderComponent;
}

export default renderComponent;
