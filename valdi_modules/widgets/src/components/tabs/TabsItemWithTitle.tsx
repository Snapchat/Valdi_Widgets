import { Device } from 'valdi_core/src/Device';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { Label, Layout, View } from 'valdi_tsx/src/NativeTemplateElements';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { ScrollBarHandler } from '../scroll/scrollbar/ScrollBarHandler';
import { TabsItem } from './TabsItem';

/**
 * Represents this particular type of tabs:
 *  - a title label
 *  - an optional badge (a dot or a text badge)
 *  - a custom content
 * this is the most common type of tabs
 */
export interface TabsItemWithTitle {
  key?: string;
  scrollBarHandler?: ScrollBarHandler;
  title: string;
  badged?: boolean | string;
  // Optional custom render for the title
  renderTitle?: (focused: boolean) => void;
  render: (focused: boolean) => void;
}

/**
 * Convert standard high-level tabs item with title to usable tabs items
 */
export function convertToTabItems(tabsItems: TabsItemWithTitle[], textColor?: SemanticColor): TabsItem[] {
  return tabsItems.map(item => ({
    key: item.key,
    scrollBarHandler: item.scrollBarHandler,
    renderHeader: item.renderTitle || (() => renderDefaultHeader(item.badged, item.title, textColor)),
    renderContent: item.render,
  }));
}

function renderDefaultHeader(badged: boolean | string | undefined, title: string, textColor?: SemanticColor): void {
  <layout style={styles.itemBox}>
    <label style={styles.itemLabel} value={title} color={textColor} />;
    {when(badged, () => {
      if (typeof badged === 'boolean') {
        <view style={styles.itemBadge} />;
      }
      if (typeof badged === 'string') {
        <view style={styles.itemTextBadgeView}>
          <label style={styles.itemTextBadgeLabel} value={badged} />;
        </view>;
      }
    })}
  </layout>;
}

/**
 * Elements static styling
 */
const styles = {
  itemBox: new Style<Layout>({
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.SM,
    paddingLeft: Spacing.MD,
    paddingRight: Spacing.MD,
    paddingBottom: Spacing.SM,
  }),
  itemLabel: new Style<Label>({
    font: TextStyleFont.BODY_EMPHASIS,
    color: SemanticColor.Text.PRIMARY,
  }),
  itemBadge: new Style<View>({
    backgroundColor: SemanticColor.Background.DEFAULT,
    height: 6,
    width: 6,
    marginLeft: 4,
    marginRight: -4,
    borderRadius: 3,
  }),
  itemTextBadgeView: new Style<View>({
    paddingLeft: Spacing.XXS,
    paddingRight: Spacing.XXS,
    backgroundColor: SemanticColor.Background.DEFAULT,
    borderRadius: Spacing.XS,
    marginBottom: Spacing.SM,
    marginLeft: Spacing.XXS,
  }),
  itemTextBadgeLabel: new Style<Label>({
    font: TextStyleFont.CAPTION_EMPHASIS,
    // Use Black color under dark mode to make the text more visible on SemanticColor.Brand.PRIMARY bg color
    color: Device.isDarkMode() ? SemanticColor.Base.FADED_BLACK : SemanticColor.Text.PRIMARY,
  }),
};
