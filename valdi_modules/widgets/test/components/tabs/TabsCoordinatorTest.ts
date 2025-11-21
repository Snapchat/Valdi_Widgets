import { TabsCoordinator } from 'widgets/src/components/tabs/TabsCoordinator';
import 'jasmine/src/jasmine';

describe('TabsCoordinator', () => {
  it('initializes subjects as undefined', () => {
    const coordinator = new TabsCoordinator();
    expect(coordinator.index.value).toBeUndefined();
    expect(coordinator.items.value).toBeUndefined();
  });

  it('emits tap and navigation events', () => {
    const coordinator = new TabsCoordinator();
    const tapSpy = jasmine.createSpy('tap');
    const navSpy = jasmine.createSpy('nav');

    coordinator.onTap.subscribe(tapSpy);
    coordinator.onNav.subscribe(navSpy);

    coordinator.onTap.next(1);
    coordinator.onNav.next(2);

    expect(tapSpy).toHaveBeenCalledWith(1);
    expect(navSpy).toHaveBeenCalledWith(2);
  });
});
