import { convertToTabItems } from 'widgets/src/components/tabs/TabsItemWithTitle';
import 'jasmine/src/jasmine';
import { SemanticColor } from 'widgets/src/styles/semanticColors';

describe('TabsItemWithTitle', () => {
  it('converts items with custom renderTitle', () => {
    const renderTitle = jasmine.createSpy('renderTitle');
    const renderContent = jasmine.createSpy('renderContent');
    const [item] = convertToTabItems([
      { key: 'k', title: 'Tab', renderTitle, render: renderContent },
    ]);

    // Verify the converted item has the expected structure
    expect(item.key).toBe('k');
    expect(item.renderHeader).toBe(renderTitle);
    expect(item.renderContent).toBe(renderContent);
  });

  it('converts items without custom renderTitle', () => {
    const renderContent = jasmine.createSpy('renderContent');
    const [item] = convertToTabItems([
      { key: 'tab1', title: 'Tab', badged: true, render: renderContent },
    ], SemanticColor.Text.SECONDARY);

    // Verify the converted item has the expected structure
    expect(item.key).toBe('tab1');
    expect(item.renderContent).toBe(renderContent);
    // renderHeader should be a function (the default header renderer)
    expect(typeof item.renderHeader).toBe('function');
  });

  it('preserves scrollBarHandler when provided', () => {
    const mockScrollBarHandler = {} as any;
    const [item] = convertToTabItems([
      { key: 'k', title: 'Tab', scrollBarHandler: mockScrollBarHandler, render: jasmine.createSpy('render') },
    ]);

    expect(item.scrollBarHandler).toBe(mockScrollBarHandler);
  });
});
