import { StatefulComponent } from 'valdi_core/src/Component';
import { ValdiRuntime } from 'valdi_core/src/ValdiRuntime';
import res from 'widgets/res';
import { AnimationRotate } from 'widgets/src/components/animation/AnimationRotate';
import { AnimationShimmer } from 'widgets/src/components/animation/AnimationShimmer';
import { CoreButton, CoreButtonColoring, CoreButtonSizing } from 'widgets/src/components/button/CoreButton';
import { Section } from 'widgets/src/components/section/Section';
import { SectionSeparator } from 'widgets/src/components/section/SectionSeparator';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { Spacing } from 'widgets/src/styles/spacing';
import {registerSemanticColors} from 'widgets/src/RegisterSemanticColors'
import { setTheme } from 'widgets/src/InitSemanticColors';
import { ThemeDark, ThemeLight, ThemeMidnight } from 'widgets/src/ColorSpec';
import { RadioToggle } from 'widgets/src/components/toggle/RadioToggle';
import { TabsItem } from 'widgets/src/components/tabs/TabsItem'
import { TabsContent } from 'widgets/src/components/tabs/TabsContent'
import { TabsHeader } from 'widgets/src/components/tabs/TabsHeader'
import { TabsCoordinator} from 'widgets/src/components/tabs/TabsCoordinator'
import { convertToTabItems} from 'widgets/src/components/tabs/TabsItemWithTitle'
import { ScrollViewHandler } from 'widgets/src/components/scroll/ScrollViewHandler';

declare const runtime: ValdiRuntime;

/**
 * @Context
 * @ExportModel({
 *  ios: 'SCCPlaygroundContext',
 *  android: 'com.snap.valdi.widgets.PlaygroundContext'
 * })
 */
export interface PlaygroundContext {
  onDone?: () => void;
}
/**
 * Internal state of the component.
 */
interface PlaygroundState {
  theme: string
}
/**
 * @Component
 * @ExportModel({
 *  ios: 'SCCPlaygroundView',
 *  android: 'com.snap.valdi.widgets.PlaygroundView'
 * })
 */
export class Playground extends StatefulComponent<{}, PlaygroundState, PlaygroundContext> {
  state: PlaygroundState = {
    theme: ThemeLight
  };

  onCreate(): void {
    registerSemanticColors();
  }

  updateTheme(label: string) { return () => {
    this.setState({
      theme: label
    })
  }}

  tabs: TabsItem[] = convertToTabItems([
     {
      title: "First",
      render: (focused) => {
        <layout flexDirection='row' alignItems='center' padding={8}>
        <RadioToggle on={this.state.theme == ThemeLight} onTap={this.updateTheme(ThemeLight)}/><label margin='6' value={ThemeLight} />
        <RadioToggle on={this.state.theme == ThemeDark} onTap={this.updateTheme(ThemeDark)} /><label margin='6' value={ThemeDark} />
        <RadioToggle on={this.state.theme == ThemeMidnight} onTap={this.updateTheme(ThemeMidnight)} /><label margin='6' value={ThemeMidnight} />
      </layout>        
      }
    },
    {
      title: "Second",
      render: () => {
        <layout flexDirection='row' alignItems='center' padding={8}>
        <RadioToggle on={this.state.theme == ThemeLight} onTap={this.updateTheme(ThemeLight)}/><label margin='6' value={ThemeLight} />
        <RadioToggle on={this.state.theme == ThemeDark} onTap={this.updateTheme(ThemeDark)} /><label margin='6' value={ThemeDark} />
        <RadioToggle on={this.state.theme == ThemeMidnight} onTap={this.updateTheme(ThemeMidnight)} /><label margin='6' value={ThemeMidnight} />
      </layout>        
      }
    },
  ], 'red')
  
  tabsCoordinator = new TabsCoordinator();

  scrollViewHandler = new ScrollViewHandler();

  onRender() {
    { setTheme(this.state.theme, false) }
    <view backgroundColor={SemanticColor.Background.SUBSCREEN}>
    <TabsHeader tabsItemsArray={this.tabs} tabsCoordinator={this.tabsCoordinator}/>
    <TabsContent tabsCoordinator={this.tabsCoordinator} scrollViewHandler={this.scrollViewHandler} />
    <scroll>
        <view padding='60 20' backgroundColor={SemanticColor.Background.SUBSCREEN}>
          {/* The view is a simple view with a background color that can react to touch events */}
          <Section title='Themes' />
          <layout flexDirection='row' alignItems='center' padding={8}>
            <RadioToggle on={this.state.theme == ThemeLight} onTap={this.updateTheme(ThemeLight)}/><label margin='6' value={ThemeLight} />
            <RadioToggle on={this.state.theme == ThemeDark} onTap={this.updateTheme(ThemeDark)} /><label margin='6' value={ThemeDark} />
            <RadioToggle on={this.state.theme == ThemeMidnight} onTap={this.updateTheme(ThemeMidnight)} /><label margin='6' value={ThemeMidnight} />
          </layout>
          <Section title='The <view>'>
            <layout flexDirection='row'>
              <view
                margin={5}
                backgroundColor={SemanticColor.Brand.PRIMARY}
                borderRadius={25}
                height={50}
                width={50}
              />
              <view margin={5} backgroundColor={SemanticColor.Brand.PRIMARY} height={50} width={50} />
              <view margin={5} backgroundColor={SemanticColor.Brand.SECONDARY} rotation={0.2} height={50} width={50} />
              <view
                margin={5}
                backgroundColor={SemanticColor.Brand.PRIMARY}
                boxShadow='0 4 4 rgba(0, 0, 0, 0.5)'
                height={50}
                width={50}
              />
              <AnimationShimmer margin={5} height={50} width={50} borderRadius={10} />
            </layout>
          </Section>
          <SectionSeparator />
          {/* The label is used to display text of all kinds */}
          <Section title='The <label>'>
            <label value='hello1' font={TextStyleFont.TITLE_1} />
            <label value='hello2' font={TextStyleFont.TITLE_2} />
            <label value='hello3' font={TextStyleFont.TITLE_3} />
            <label value='hello4' font={TextStyleFont.TITLE_4} />
          </Section>
          <SectionSeparator />
          {/* The image is used to display bitmaps that can be loaded from assets or URLs */}
          <Section title='The <image>'>
            <layout flexDirection='row'>
              <image margin={5} height={50} width={50} src='https://placecats.com/poppy/300/200%22' />
              <image margin={5} height={50} width={50} src='https://placecats.com/g/300/200%22' borderRadius={20} />
              <image margin={5} height={50} width={50} src={res.iconEllipsis} />
              <AnimationRotate revolutionPerSecond={1}>
                <image
                  margin={5}
                  height={50}
                  width={50}
                  tint={SemanticColor.Brand.SECONDARY}
                  src={res.iconQuestionMark}
                />
              </AnimationRotate>
            </layout>
          </Section>
          <SectionSeparator />
          {/* The scroll is the easy way to make your content scrollable both horizontally and vertically */}
          <Section title='The <scroll>'>
            <scroll height={150} background={SemanticColor.Background.OBJECT_DOWN} padding={5}>
              <scroll horizontal height={60} background={SemanticColor.Background.OBJECT_DOWN} margin={5} padding={5}>
                {'Horizontal Scrolling Content'.split('').forEach(value => {
                  <label value={value} font={TextStyleFont.BODY} margin={5} />;
                })}
              </scroll>
              {'Vertical Scrolling Content'.split('').forEach(value => {
                <label value={value} font={TextStyleFont.BODY} margin={5} />;
              })}
            </scroll>
          </Section>
          <Section title='The Errors'>
            <CoreButton
              text='Throw Uncaught Exception'
              coloring={CoreButtonColoring.PRIMARY}
              sizing={CoreButtonSizing.SMALL}
              onTap={this.throwUncaughtException}
            />
            <SectionSeparator spacing={Spacing.XS} />
            <CoreButton
              text='Simulate ANR (App Not Responding)'
              coloring={CoreButtonColoring.PRIMARY}
              sizing={CoreButtonSizing.SMALL}
              onTap={this.simulateANR}
            />
          </Section>
          <SectionSeparator />
          <SectionSeparator />
          {/* Events like touch and taps are natively supported and can call typescript cross-platform business logic directly */}
          {/*<GettingStartedCodelab></GettingStartedCodelab>*/}
          <layout alignItems='center' padding={10}>
            {/* Note that we can re-use components equivalent to many SIG/Snap Views */}
            <CoreButton
              text='Tap here when done'
              coloring={CoreButtonColoring.PRIMARY}
              sizing={CoreButtonSizing.LARGE}
              onTap={this.context.onDone}
            />
            {/* Documentation is important! */}
            <label font={TextStyleFont.CAPTION} value='Checkout the documentation at: https://github.com/Snapchat/Valdi/tree/main/docs' textAlign='center' />
          </layout>
        </view>
      </scroll>
    </view>;
  }

  private throwUncaughtException = () => {
    console.log('Generating Uncaught Exception');
    throw new Error('Uncaught Exception Message');
  };

  /**
   * This function is used to simulate an ANR (App Not Responding) to test our ANR detection mechanism.
   *
   * Stacktraces are only recorded on interrupts, which has implications for the engines we support:
   * On QuickJS we have a callback that the engine calls at regular interval while it's
   * interpreting JS bytecode. It's an interrupt callback and it's called arbitrarily.
   * On Hermes and JSCore we don't have such a callback, so we need to make
   * a native call to simulate it. In practice we do a lot of native calls (like console.log),
   * this should hopefully catch the vast majority of ANRs.
   *
   * See: JavaScriptRuntime::onInterrupt
   */
  private simulateANR = () => {
    console.log('Simulating ANR for 10 seconds');
    const start = Date.now();
    while (Date.now() - start < 10000) {
      runtime.getCurrentPlatform();
    }
  };
}
