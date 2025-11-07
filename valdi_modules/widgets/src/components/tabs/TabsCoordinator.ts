import { BehaviorSubject } from 'valdi_rxjs/src/BehaviorSubject';
import { Subject } from 'valdi_rxjs/src/Subject';
import { TabsItem } from './TabsItem';

export interface TabsCoordinatorItems {
  array: TabsItem[];
  initialIndex?: number;
}

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
