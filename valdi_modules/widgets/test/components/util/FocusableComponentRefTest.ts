import { FocusableComponentRef } from 'widgets/src/components/util/FocusableComponentRef';
import 'jasmine/src/jasmine';
import { Device } from 'valdi_core/src/Device';
import * as SetTimeout from 'valdi_core/src/SetTimeout';

describe('FocusableComponentRef', () => {
  const makeComponent = () => ({ setFocused: jasmine.createSpy('setFocused') });

  it('focuses next created component when requested', () => {
    const ref = new FocusableComponentRef();
    const component = makeComponent();

    ref.setFocused(true);
    ref.onComponentDidCreate(component as any, {} as any);

    expect(component.setFocused).toHaveBeenCalledWith(true);
  });

  it('does not auto-focus after blur', () => {
    const ref = new FocusableComponentRef();
    const component = makeComponent();

    ref.setFocused(true);
    ref.setFocused(false);
    ref.onComponentDidCreate(component as any, {} as any);

    expect(component.setFocused).not.toHaveBeenCalled();
  });

  it('delays focus on iOS when configured', () => {
    const ref = new FocusableComponentRef({ delayBeforeFocusingOnIOS: true });
    const component = makeComponent();
    spyOn(Device, 'isIOS').and.returnValue(true);
    const timeoutSpy = spyOn(SetTimeout, 'setTimeoutInterruptible').and.callFake((handler: () => void) => {
      handler();
      return 0;
    });

    ref.setFocused(true);
    ref.onComponentDidCreate(component as any, {} as any);

    expect(timeoutSpy).toHaveBeenCalled();
    expect(component.setFocused).toHaveBeenCalledWith(true);
  });
});
