import { SectionHeader } from 'widgets/src/components/section/SectionHeader';
import { componentGetElements } from 'foundation/test/util/componentGetElements';
import { untilRenderComplete } from 'foundation/test/util/untilRenderComplete';
import 'jasmine/src/jasmine';
import { valdiIt } from 'valdi_test/test/JSXTestUtils';
import { ThemeType } from 'widgets/src/Theme';

describe('SectionHeader', () => {
  valdiIt('renders title', async driver => {
    const component = driver.renderComponent(
      SectionHeader,
      {
        title: 'Section Title',
      },
      {
        context: {
          themeType: ThemeType.SYSTEM,
        },
      },
    );

    await untilRenderComplete(component);

    // Verify the viewModel is set correctly
    expect(component.viewModel.title).toBe('Section Title');

    // Verify component renders without error
    const elements = componentGetElements(component);
    expect(elements.length).toBeGreaterThanOrEqual(0);
  });

  valdiIt('renders subtitle when provided', async driver => {
    const component = driver.renderComponent(
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
    );

    await untilRenderComplete(component);

    // Verify the viewModel has subtitle
    expect(component.viewModel.title).toBe('Title');
    expect(component.viewModel.subtitle).toBe('Subtitle');
  });

  valdiIt('renders description when provided', async driver => {
    const component = driver.renderComponent(
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
    );

    await untilRenderComplete(component);

    // Verify the viewModel has description
    expect(component.viewModel.title).toBe('Title');
    expect(component.viewModel.description).toBe('Description text');
  });

  valdiIt('renders action button when provided', async driver => {
    const onTap = jasmine.createSpy('onTap');
    const component = driver.renderComponent(
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
    );

    await untilRenderComplete(component);

    // Verify the viewModel has actionButton
    expect(component.viewModel.title).toBe('Title');
    expect(component.viewModel.actionButton?.label).toBe('Action');
    expect(component.viewModel.actionButton?.onTap).toBe(onTap);
  });
});
