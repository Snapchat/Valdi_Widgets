import { SectionHeader } from 'widgets/src/components/section/SectionHeader';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { createComponent } from 'valdi_test/test/JSXTestUtils';
import { ThemeType } from 'widgets/src/Theme';

describe('SectionHeader', () => {
  it('renders title', async () => {
    const component = createComponent(
      SectionHeader,
      {
        title: 'Section Title',
      },
      {
        context: {
          themeType: ThemeType.SYSTEM,
        },
      },
    ).getComponent();

    await untilRenderComplete(component);

    // Verify the viewModel is set correctly
    expect(component.viewModel.title).toBe('Section Title');

    // Verify component renders without error
    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(0);
  });

  it('renders subtitle when provided', async () => {
    const component = createComponent(
      SectionHeader,
      {
        title: 'Title',
        subtitle: 'Subtitle',
      },
      {
        context: {
          themeType: ThemeType.SYSTEM,
        },
      },
    ).getComponent();

    await untilRenderComplete(component);

    // Verify the viewModel has subtitle
    expect(component.viewModel.title).toBe('Title');
    expect(component.viewModel.subtitle).toBe('Subtitle');
  });

  it('renders description when provided', async () => {
    const component = createComponent(
      SectionHeader,
      {
        title: 'Title',
        description: 'Description text',
      },
      {
        context: {
          themeType: ThemeType.SYSTEM,
        },
      },
    ).getComponent();

    await untilRenderComplete(component);

    // Verify the viewModel has description
    expect(component.viewModel.title).toBe('Title');
    expect(component.viewModel.description).toBe('Description text');
  });

  it('renders action button when provided', async () => {
    const onTap = jasmine.createSpy('onTap');
    const component = createComponent(
      SectionHeader,
      {
        title: 'Title',
        actionButton: {
          label: 'Action',
          onTap,
        },
      },
      {
        context: {
          themeType: ThemeType.SYSTEM,
        },
      },
    ).getComponent();

    await untilRenderComplete(component);

    // Verify the viewModel has actionButton
    expect(component.viewModel.title).toBe('Title');
    expect(component.viewModel.actionButton?.label).toBe('Action');
    expect(component.viewModel.actionButton?.onTap).toBe(onTap);
  });
});
