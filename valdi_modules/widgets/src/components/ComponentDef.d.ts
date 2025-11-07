import { IComponent, ComponentConstructor } from 'valdi_core/src/IComponent';

/**
 * Component definition.
 * Can be used to render a dynamic view within a template:
 *
 * @example
 * <componentDef.componentClass {...componentDef.viewModel} />
 */
export interface ComponentDef<ViewModel> {
  componentClass: ComponentConstructor<IComponent<ViewModel>>;
  key?: string;
  viewModel: ViewModel;
}

/**
 * Convenience type for mapping a union of view model types to a union of ComponentDefs
 * for each type
 *
 * i.e. ComponentDefUnion<Foo | Bar> = ComponentDef<Foo> | ComponentDef<Bar>
 *
 * The ternary syntax here enables typescript to map each type in the union. Since we don't impose
 * any type restrictions on view models in the union, `extends never` is used as a conditional expression
 * that always evaluates to false.
 *
 * Note: the generic ViewModel in the ternary expression refers to a type in the union, whereas ViewModel
 *       in the defintion (LHS) refers to the union itself.
 */
export type ComponentDefUnion<ViewModel> = ViewModel extends never ? never : ComponentDef<ViewModel>;
