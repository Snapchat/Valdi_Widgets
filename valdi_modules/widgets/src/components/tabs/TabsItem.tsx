import { ScrollBarHandler } from 'widgets/src/components/scroll/scrollbar/ScrollBarHandler';

/** Data contract for a single tab: supplies render functions for the header label and the tab content. */
export interface TabsItem {
  key?: string;
  scrollBarHandler?: ScrollBarHandler;
  renderHeader: (focused: boolean) => void;
  renderContent: (focused: boolean) => void;
}
