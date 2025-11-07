import { Style } from 'valdi_core/src/Style';
import { systemBoldFont } from 'valdi_core/src/SystemFont';
import { Label, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

export const SUBTITLE_DELIMITER = '·';

/**
 * Cell packing is surprisingly important as it impacts the amount of information displayed on screen
 * Each team historically used slightly different padding and spacing strategies
 * depending on criticality of the information being displayed
 * Consider using the "Spacious" packing moving forward
 */
export enum CellPacking {
  Small50 = 'small-50', // Used in small cell for commerce
  Medium56 = 'medium-56', // Used in context/communities for tight lists
  Large66 = 'large-66', // Used in friending screens to display list of users
  Large70 = 'large-70', // DEFAULT. Used in search and commerce for full-size cells. It's the default for backwards compatibility, but consider using Spacious instead.
  Spacious = 'spacious', // Most standard, recommended spacing, least "crammed", most spacious
}

/**
 * Packing parameters
 */
export const packingRootMinHeights = {
  [CellPacking.Spacious]: undefined,
  [CellPacking.Large70]: undefined,
  [CellPacking.Large66]: 66,
  [CellPacking.Medium56]: 56,
  [CellPacking.Small50]: 50,
};
export const packingRootVerticalPaddings = {
  [CellPacking.Spacious]: 10,
  [CellPacking.Large70]: 9,
  [CellPacking.Large66]: 5,
  [CellPacking.Medium56]: 3,
  [CellPacking.Small50]: 3,
};
export const packingRootHorizontalPaddings = {
  [CellPacking.Spacious]: 16,
  [CellPacking.Large70]: 11,
  [CellPacking.Large66]: 11,
  [CellPacking.Medium56]: 6,
  [CellPacking.Small50]: 6,
};
export const packingSubtitleMinHeights = {
  [CellPacking.Spacious]: undefined,
  [CellPacking.Large70]: 17 /* Avoid vertical shifting when an accessory is present without an accompanying label. */,
  [CellPacking.Large66]: undefined,
  [CellPacking.Medium56]: undefined,
  [CellPacking.Small50]: undefined,
};

/**
 * Styling parameters
 */
const genericContainerStyle = new Style<Layout>({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const labelBase = new Style<Label>({
  flexShrink: 1,
});

const reasonLabelSize = 9;

/**
 * Styles structures
 */
export const style = {
  /**
   * Containers
   */
  container: {
    root: genericContainerStyle.extend({
      paddingRight: 11,
      paddingLeft: 11,
      paddingTop: 9,
      paddingBottom: 9,
    }),
    title: genericContainerStyle.extend({}),
    subtitle: genericContainerStyle.extend({
      marginTop: 1,
    }),
    accessory: new Style<Layout>({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    labels: new Style<Layout>({
      display: 'flex',
      flexGrow: 1,
      flexShrink: 1,
      justifyContent: 'center',
    }),
    wrappable: new Style<Layout>({
      flexWrap: 'wrap',
      flexShrink: 1,
      flexDirection: 'row',
    }),
    nonWrappable: new Style<Layout>({
      flexWrap: 'no-wrap',
      flexShrink: 1,
      flexDirection: 'row',
    }),
  },
  /**
   * Labels
   */
  label: {
    title: Style.merge(
      labelBase,
      new Style<Label>({
        font: TextStyleFont.BODY,
        color: SemanticColor.Text.PRIMARY,
      }),
    ),
    subtitle: Style.merge(
      labelBase,
      new Style<Label>({
        font: TextStyleFont.CAPTION,
        color: SemanticColor.Text.PRIMARY,
      }),
    ),
    delimiter: Style.merge(
      labelBase,
      new Style<Label>({
        font: TextStyleFont.CAPTION,
        color: SemanticColor.Text.PRIMARY,
      }),
      new Style<Layout>({
        margin: '0 4',
      }),
    ),
    identity: Style.merge(
      labelBase,
      new Style<Label>({
        font: TextStyleFont.CAPTION_EMPHASIS,
        color: SemanticColor.Text.SECONDARY,
      }),
    ),
    // Note: this is a one-off type style
    // See if reason should replace the subtitle line instead
    reason: Style.merge(
      labelBase,
      new Style<Label>({
        font: systemBoldFont(reasonLabelSize),
        lineHeight: (reasonLabelSize + 2) / reasonLabelSize,
        color: SemanticColor.Text.SECONDARY,
        letterSpacing: 0.2,
      }),
    ),
  },
};
