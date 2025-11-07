import { ComponentDef } from '../ComponentDef';

interface ComponentDefRendererViewModel<Def> {
  componentDef: Def;
}

/**
 * Renders a Component based of the params from a {@see ComponentDef}
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ComponentDefRenderer<Def extends ComponentDef<{}>>(
  viewModel: ComponentDefRendererViewModel<Def>,
): void {
  const componentDef = viewModel.componentDef;
  <componentDef.componentClass {...componentDef.viewModel} key={componentDef.key} />;
}
