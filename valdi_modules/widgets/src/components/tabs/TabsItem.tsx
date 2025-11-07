import { ScrollBarHandler } from '../scroll/scrollbar/ScrollBarHandler';

export interface TabsItem {
  key?: string;
  scrollBarHandler?: ScrollBarHandler;
  renderHeader: (focused: boolean) => void;
  renderContent: (focused: boolean) => void;
}
