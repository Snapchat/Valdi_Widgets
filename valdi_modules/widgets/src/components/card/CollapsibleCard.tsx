import { PresetCurveAnimationOptions } from 'valdi_core/src/AnimationOptions';
import { StatefulComponent } from 'valdi_core/src/Component';
import { Lazy } from 'valdi_core/src/Lazy';
import { Style } from 'valdi_core/src/Style';
import { when } from 'valdi_core/src/utils/When';
import { ElementFrame } from 'valdi_tsx/src/Geometry';
import { Label, View, Layout } from 'valdi_tsx/src/NativeTemplateElements';
import { ComponentDef } from 'widgets/src/components/ComponentDef';
import { Card, CardShadow } from 'widgets/src/components/card/Card';
import { HorizontalRule } from 'widgets/src/components/rules/HorizontalRule';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import { RenderFunction } from '../RenderFunction';
import { ScrollViewHandler } from '../scroll/ScrollViewHandler';

export interface CollapsibleCardRenderFunction {
  renderFunction: RenderFunction;
  key?: string;
}

export interface CollapsibleCardViewModel<T extends {}> {
  scrollViewHandler?: ScrollViewHandler;

  // We should only supply one of these, but it'll take renderFunctions over componentDefs while migrating
  renderFunctions?: CollapsibleCardRenderFunction[];
  componentDefs?: ComponentDef<T>[];

  /**
   * If set, each item will be rendered in a lazy component.
   * This can significantly improve first render latency.
   * You can use the MeasureCache or ComponentMeasurer component
   * to resolve a size before rendering the CollapsibleCard component.
   */
  rowHeight?: number;
  maxNumCollapsedComponents: number;
  numExpandingIncrement?: number;

  displayViewMoreCount?: boolean;
  expandTextTemplate?: (count: number) => string;
  expandTextInBadge?: string;
  expandText: string;
  expandTextColor?: SemanticColor;
  collapseText: string;
  backgroundColor?: SemanticColor;
  borderWidth?: number | string;
  borderColor?: SemanticColor;
  expandCardBackgroundColor?: SemanticColor | undefined;
  dividerColor?: SemanticColor;

  shadow?: CardShadow;

  cardBackgroundHidden?: boolean;

  onExpand?: () => void;
  onWillCollapse?: (heightBefore: number, heightAfter: number) => void;
  onCollapse?: () => void;

  viewMoreAccessibilityId?: string;
}

enum CollapseState {
  Expanding,
  ExpandedFully,
  ExpandedPartially,
  Collapsing,
  Collapsed,
}

interface CollapsibleCardState {
  collapseState: CollapseState;
  expandedCount: number;
}

const animationOptions: PresetCurveAnimationOptions = {
  duration: 0.2,
};

export class CollapsibleCard<T extends {}> extends StatefulComponent<
  CollapsibleCardViewModel<T>,
  CollapsibleCardState
> {
  state = {
    collapseState: CollapseState.Collapsed,
    expandedCount: 0,
  };

  private collapsedCardHeight = 0;
  private uncollapsedCardHeight = 0;

  onRender(): void {
    const viewModel = this.viewModel ?? {};
    const expendTextBadge = this.getPromptNewLabel();
    <Card
      shadow={this.viewModel.cardBackgroundHidden ? CardShadow.NONE : viewModel.shadow}
      backgroundColor={viewModel.backgroundColor}
      borderWidth={viewModel.borderWidth}
      borderColor={viewModel.borderColor}
    >
      <view onLayout={this.onLayoutCard} height={this.getCardHeight()} slowClipping={this.getNeedsClipping()}>
        {this.renderRows(viewModel.rowHeight, viewModel.renderFunctions, viewModel.componentDefs)}
      </view>
      {when(this.getShouldShowButton(), () => {
        const buttonLabel = this.getButtonLabel();
        if (!this.viewModel.cardBackgroundHidden) {
          <HorizontalRule color={viewModel.dividerColor} />;
        }
        <view
          accessibilityId={viewModel.viewMoreAccessibilityId}
          style={expandButtonContainerStyle}
          onTap={this.onTapExpandOrCollapse}
          accessibilityCategory='button'
          accessibilityLabel={buttonLabel}
          backgroundColor={viewModel.expandCardBackgroundColor}
        >
          <layout style={expandButtonNewContainerStyle}>
            {when(expendTextBadge, () => {
              <view style={expandButtonNewBgStyle}>
                <label style={expandButtonNewStyle} value={expendTextBadge} />
              </view>;
            })}
          </layout>
          <layout style={expandButtonLabelContainerStyle}>
            <label style={expandButtonLabelStyle} value={buttonLabel} color={viewModel.expandTextColor} />
          </layout>
          <layout style={expandButtonNewContainerStyle} />
        </view>;
      })}
    </Card>;
  }

  onTapExpandOrCollapse = (): void => {
    switch (this.state.collapseState) {
      // When nothing left to expand
      case CollapseState.ExpandedFully:
        this.collapse();
        break;
      // When some things are left to expand
      case CollapseState.Collapsed:
      case CollapseState.ExpandedPartially:
        this.expand();
        break;
      // During animation, do nothing
      case CollapseState.Expanding:
      case CollapseState.Collapsing:
        // No - op
        break;
    }
  };

  getIsFullyVisible(): boolean {
    return this.getNumberOfEntries() <= this.getMaxNumCollapsedComponents() + this.state.expandedCount;
  }

  private renderRow(
    row: number,
    renderFunction: CollapsibleCardRenderFunction | undefined,
    componentDef: ComponentDef<T> | undefined,
  ): void {
    if (row > 0 && !this.viewModel.cardBackgroundHidden) {
      <HorizontalRule color={this.viewModel.dividerColor} />;
    }

    if (renderFunction) {
      renderFunction.renderFunction();
    } else if (componentDef) {
      <componentDef.componentClass {...componentDef.viewModel} />;
    } else {
      throw new Error('Neither component defs or render functions set');
    }
  }

  private forEachRow(
    renderFunctions: CollapsibleCardRenderFunction[] | undefined,
    componentDefs: ComponentDef<T>[] | undefined,
    callback: (
      row: number,
      key: string,
      renderFunction: CollapsibleCardRenderFunction | undefined,
      componentDef: ComponentDef<T> | undefined,
    ) => void,
  ): void {
    for (let i = 0; i < this.getCountVisible(); i++) {
      let key: string | undefined;
      let renderFunction: CollapsibleCardRenderFunction | undefined;
      let componentDef: ComponentDef<T> | undefined;

      if (renderFunctions) {
        renderFunction = renderFunctions[i];
        key = renderFunction.key;
      } else if (componentDefs) {
        componentDef = componentDefs[i];
        key = componentDef.key;
      }

      if (!key) {
        key = i.toString();
      }

      callback(i, key, renderFunction, componentDef);
    }
  }

  private renderRows(
    rowHeight: number | undefined,
    renderFunctions: CollapsibleCardRenderFunction[] | undefined,
    componentDefs: ComponentDef<T>[] | undefined,
  ): void {
    if (rowHeight !== undefined) {
      // Render with lazy components
      this.forEachRow(renderFunctions, componentDefs, (row, key, renderFunction, componentDef) => {
        <Lazy width={'100%'} height={row > 0 ? rowHeight + 1 : rowHeight} key={key}>
          {this.renderRow(row, renderFunction, componentDef)}
        </Lazy>;
      });
    } else {
      this.forEachRow(renderFunctions, componentDefs, (row, key, renderFunction, componentDef) => {
        <layout key={key}>{this.renderRow(row, renderFunction, componentDef)}</layout>;
      });
    }
  }

  private onCollapsed(): void {
    this.renderer.batchUpdates(() => {
      this.setState({ collapseState: CollapseState.Collapsed, expandedCount: 0 });

      const { onCollapse } = this.viewModel;
      if (onCollapse) {
        onCollapse();
      }

      const scrollViewHandler = this.viewModel.scrollViewHandler;
      if (scrollViewHandler) {
        scrollViewHandler.notifyRegionDidChange();
      }
    });
  }

  private expand(): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.setStateAnimatedPromise(
      {
        collapseState: CollapseState.Expanding,
        expandedCount: this.state.expandedCount + this.getNumExpandingIncrement(),
      },
      animationOptions,
    ).then(() => {
      if (this.getIsFullyVisible()) {
        this.setState({ collapseState: CollapseState.ExpandedFully });
      } else {
        this.setState({ collapseState: CollapseState.ExpandedPartially });
      }
    });

    const { onExpand } = this.viewModel;
    if (onExpand) {
      onExpand();
    }
  }

  private collapse(): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.animatePromise(animationOptions, () => {
      this.setState({ collapseState: CollapseState.Collapsing });

      const { onWillCollapse } = this.viewModel;
      if (onWillCollapse) {
        onWillCollapse(this.uncollapsedCardHeight, this.collapsedCardHeight);
      }

      const scrollViewHandler = this.viewModel.scrollViewHandler;
      if (scrollViewHandler) {
        scrollViewHandler.notifyRegionWillChange(0, 0, 0, this.uncollapsedCardHeight, 0, this.collapsedCardHeight);
      }
    }).then(() => {
      this.onCollapsed();
    });
  }

  private onLayoutCard = (frame: ElementFrame): void => {
    switch (this.state.collapseState) {
      // When we are fully collapsed, save original height
      case CollapseState.Collapsed:
        this.collapsedCardHeight = frame.height;
        break;
      // In all other case, just save the latest height
      case CollapseState.ExpandedFully:
      case CollapseState.ExpandedPartially:
      case CollapseState.Collapsing:
      case CollapseState.Expanding:
        this.uncollapsedCardHeight = frame.height;
        break;
    }
  };

  private getCardHeight(): number | undefined {
    switch (this.state.collapseState) {
      // When collapsing, we want to animate on the height, while users are still displayed underneath
      case CollapseState.Collapsing:
        return this.collapsedCardHeight;
      // In all other cases, the height is simply dictated by the rendered users
      case CollapseState.ExpandedFully:
      case CollapseState.ExpandedPartially:
      case CollapseState.Collapsed:
      case CollapseState.Expanding:
        return undefined;
    }
  }

  private getNeedsClipping(): boolean {
    switch (this.state.collapseState) {
      // When animating we need to clip
      case CollapseState.Collapsing:
      case CollapseState.Expanding:
        return true;
      // In all other cases, the height is simply dictated by the rendered users
      case CollapseState.ExpandedFully:
      case CollapseState.ExpandedPartially:
      case CollapseState.Collapsed:
        return false;
    }
  }

  private getMaxNumCollapsedComponents(): number {
    return this.viewModel.maxNumCollapsedComponents ?? Infinity;
  }
  private getNumExpandingIncrement(): number {
    return this.viewModel.numExpandingIncrement ?? Infinity;
  }

  private getCountVisible(): number {
    return Math.min(this.getNumberOfEntries(), this.getMaxNumCollapsedComponents() + this.state.expandedCount);
  }

  private getShouldShowButton(): boolean {
    return this.getNumberOfEntries() > this.getMaxNumCollapsedComponents();
  }

  private getButtonLabel(): string | undefined {
    if (this.getIsFullyVisible()) {
      return this.viewModel.collapseText;
    } else {
      if (this.viewModel.displayViewMoreCount && this.viewModel.expandTextTemplate) {
        const unviewedCount = this.getNumberOfEntries() - this.getCountVisible();
        return this.viewModel.expandTextTemplate(unviewedCount);
      } else {
        return this.viewModel.expandText;
      }
    }
  }

  private getPromptNewLabel(): string | undefined {
    if (this.getIsFullyVisible()) {
      return '';
    } else {
      return this.viewModel.expandTextInBadge;
    }
  }

  private getNumberOfEntries(): number {
    const { componentDefs, renderFunctions } = this.viewModel;
    if (renderFunctions) {
      return renderFunctions.length;
    } else if (componentDefs) {
      return componentDefs.length;
    } else {
      throw new Error('Neither componentDefs or Render Function set.');
    }
  }
}

const expandButtonContainerStyle = new Style<Layout>({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 42,
});

const expandButtonLabelContainerStyle = new Style<Layout>({
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: Spacing.SM,
  paddingRight: Spacing.SM,
});

const expandButtonLabelStyle = new Style<Label>({
  font: TextStyleFont.SUBHEADLINE_EMPHASIS,
  color: SemanticColor.Text.PRIMARY,
});

const expandButtonNewContainerStyle = new Style<Layout>({
  paddingTop: Spacing.SM,
  paddingBottom: Spacing.SM,
});

const expandButtonNewBgStyle = new Style<View>({
  backgroundColor: SemanticColor.Brand.PRIMARY,
  borderRadius: 4,
  paddingTop: Spacing.XXS,
  paddingBottom: Spacing.XXS,
  paddingLeft: Spacing.XS,
  paddingRight: Spacing.XS,
});

const expandButtonNewStyle = new Style<Label>({
  font: TextStyleFont.BODY,
});
