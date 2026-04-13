import { BehaviorSubject } from 'valdi_rxjs/src/BehaviorSubject';
import { Subject } from 'valdi_rxjs/src/Subject';
import { TabsItem } from './TabsItem';

export interface TabsCoordinatorItems {
  array: TabsItem[];
  initialIndex?: number;
}

/**
 * Observable coordinator that synchronizes TabsHeader and TabsContent.
 * Pass the same instance to both components; subscribe to index/onNav/onTap for programmatic control.
 */
export class TabsCoordinator {
  // Triggered when the exact index is changing
  readonly index = new BehaviorSubject<number | undefined>(undefined);
  // Triggered when the item list is changing
  readonly items = new BehaviorSubject<TabsCoordinatorItems | undefined>(undefined);

  // Triggered when a tab is tapped
  readonly onTap = new Subject<number>();
  // Triggered when a tab is navigated (through tab or scroll)
  readonly onNav = new Subject<number>();
}
