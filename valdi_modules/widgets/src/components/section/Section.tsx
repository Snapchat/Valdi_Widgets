import { Component } from 'valdi_core/src/Component';
import { SectionBody, SectionBodyViewModel } from './SectionBody';
import { SectionHeader, SectionHeaderViewModel } from './SectionHeader';

export interface SectionViewModel extends SectionHeaderViewModel, SectionBodyViewModel {}

export class Section extends Component<SectionViewModel> {
  onRender(): void {
    const { title, actionButton, actionButtonRenderFn, fullBleed, subtitle, description } = this.viewModel;
    <SectionHeader
      title={title}
      actionButton={actionButton}
      actionButtonRenderFn={actionButtonRenderFn}
      subtitle={subtitle}
      description={description}
    >
      <slot name='header' />
    </SectionHeader>;
    <SectionBody fullBleed={fullBleed}>
      <slot />
    </SectionBody>;
  }
}
