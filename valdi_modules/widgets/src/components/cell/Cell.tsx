import { Component } from 'valdi_core/src/Component';
import { ElementRef } from 'valdi_core/src/ElementRef';
import { when } from 'valdi_core/src/utils/When';
import { LabelValue } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColorsGen';

import {
  CellPacking,
  SUBTITLE_DELIMITER,
  packingRootHorizontalPaddings,
  packingRootMinHeights,
  packingRootVerticalPaddings,
  style,
} from './style';
import { DefaultCellSubtitle } from './subtitle/DefaultCellSubtitle';
import { DefaultCellTitle } from './title/DefaultCellTitle';

export enum CellSlotType {
  AccessoryLeft = 'accessory-left',
  Default = 'default',
  AccessoryTitle = 'accessory-title',
  AccessoryIdentity = 'accessory-identity',
  AccessoryRight = 'accessory-right',
  Title = 'title',
  Subtitle = 'subtitle',
}

export interface CellViewModel {
  packing?: CellPacking;

  /** Primary text for the cell. If specified then default title styling will be used. Can also be customized via the `title` slot. */
  title?: LabelValue;
  meta?: LabelValue;
  /** Accepts either a single subtitle string, or an array of strings to use as subtitle tokens, separated by a dot. */
  subtitle?: string | string[];
  /** Representational string for a given result type (e.g. "Lens", "Game") */
  identityTitle?: LabelValue;
  reason?: string;

  numTitleLines?: number;
  numSubtitleLines?: number;
  numReasonLines?: number;

  titleColor?: SemanticColor;
  subtitleColor?: SemanticColor;

  titleFont?: TextStyleFont;
  subtitleFont?: TextStyleFont;

  accessoryWidth?: number;
  accessoryAlign?: 'flex-start' | 'center' | 'flex-end';
  accessoryLeftAlign?: 'flex-start' | 'center' | 'flex-end';
  accessoryMarginRight?: number;
}

export class Cell extends Component<CellViewModel> {
  identityAccessoryRef = new ElementRef();
  rightAccessoryRef = new ElementRef();

  onCreate(): void {
    this.identityAccessoryRef.setAttribute('marginRight', 6);
    this.identityAccessoryRef.setAttribute('alignSelf', 'flex-start');
    this.rightAccessoryRef.setAttribute('marginLeft', 6);
    this.rightAccessoryRef.setAttribute('marginRight', 3);
  }

  onRender(): void {
    // Variable resolve
    const viewModel = this.viewModel ?? {};
    const accessoryWidth = viewModel.accessoryWidth ?? 48;
    const accessoryAlign = viewModel.accessoryAlign ?? 'flex-start';
    const accessoryLeftAlign = viewModel.accessoryLeftAlign ?? 'center';
    const accessoryMarginRight = viewModel.accessoryMarginRight ?? 11;
    const identityTitle = viewModel.identityTitle;
    const metaTitle = viewModel.meta;
    const reason = viewModel.reason?.toLocaleUpperCase();
    const reasonLines = viewModel.numReasonLines || 1;
    // Packing options
    const packing = viewModel.packing ?? CellPacking.Large70;
    const packingRootMinHeight = packingRootMinHeights[packing];
    const packingRootHorizontalPadding = packingRootHorizontalPaddings[packing];
    const packingRootVerticalPadding = packingRootVerticalPaddings[packing];
    {
      /* Root */
    }
    <layout
      style={style.container.root}
      minHeight={packingRootMinHeight}
      paddingTop={packingRootVerticalPadding}
      paddingBottom={packingRootVerticalPadding}
      paddingLeft={packingRootHorizontalPadding}
      paddingRight={packingRootHorizontalPadding}
    >
      {/* Left-most Accessory */}
      <layout alignSelf={accessoryLeftAlign}>
        <slot name={CellSlotType.AccessoryLeft} />
      </layout>
      {/* Accessory */}
      <layout
        width={accessoryWidth}
        style={style.container.accessory}
        alignSelf={accessoryAlign}
        marginRight={accessoryMarginRight}
      >
        <slot name={CellSlotType.Default} />
      </layout>
      {/* Labels */}
      <layout style={style.container.labels}>
        {/* Title */}
        {(() => {
          if (viewModel.title) {
            <DefaultCellTitle
              title={viewModel.title}
              numTitleLines={viewModel.numTitleLines}
              textColor={viewModel.titleColor}
              font={viewModel.titleFont}
            >
              <slotted slot={CellSlotType.AccessoryTitle}>
                <slot name={CellSlotType.AccessoryTitle} />
              </slotted>
            </DefaultCellTitle>;
          } else {
            <slot name={CellSlotType.Title} />;
          }
        })()}
        {/* Identity / Meta */}
        {when(identityTitle || metaTitle, () => {
          <layout style={style.container.wrappable}>
            {/* Identity Accessory */}
            <slot name={CellSlotType.AccessoryIdentity} ref={this.identityAccessoryRef} />
            {when(identityTitle, () => {
              <label style={style.label.identity} value={identityTitle} />;
            })}
            {when(identityTitle && metaTitle, () => {
              <label style={style.label.delimiter} value={SUBTITLE_DELIMITER} />;
            })}
            {when(metaTitle, () => {
              <label style={style.label.identity} value={metaTitle} />;
            })}
          </layout>;
        })}
        {/* Subtitle. Please see ./subtitle for available subtitle components.  */}
        {(() => {
          if (this.viewModel.subtitle) {
            <DefaultCellSubtitle
              subtitle={this.viewModel.subtitle}
              numSubtitleLines={this.viewModel.numSubtitleLines}
              color={viewModel.subtitleColor}
              font={viewModel.subtitleFont}
            />;
          } else {
            <slot name={CellSlotType.Subtitle} />;
          }
        })()}
        {/* Reason */}
        {when(reason, () => {
          <label
            accessibilityId='result-reason'
            style={style.label.reason}
            numberOfLines={reasonLines}
            value={reason}
          />;
        })}
      </layout>
      {/* Right Accessory */}
      <slot name={CellSlotType.AccessoryRight} ref={this.rightAccessoryRef} />;
    </layout>;
  }
}
