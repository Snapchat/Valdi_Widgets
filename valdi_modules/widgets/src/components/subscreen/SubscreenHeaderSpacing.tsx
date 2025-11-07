import { Component } from 'valdi_core/src/Component';
import { Spacing } from 'widgets/src/styles/spacing';

/**
 * Subscreen header spacing
 * Is designed to be used inside of a <SubscreenHeader>
 * Used in between header other components
 *
 * When using different elements in a subscreen header,
 * it is sometimes useful to have visual vertical spacing in between,
 * as the component themselves are not aware
 * of what other components they are being used with
 */
export class SubscreenHeaderSpacing extends Component {
  onRender(): void {
    <layout width='100%' height={Spacing.SM} />;
  }
}
