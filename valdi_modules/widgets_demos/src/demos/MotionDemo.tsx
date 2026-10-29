import { Component } from 'valdi_core/src/Component';
import res from 'widgets/res';
import { AnimationRotate } from 'widgets/src/components/animation/AnimationRotate';
import { AnimationShimmer } from 'widgets/src/components/animation/AnimationShimmer';
import { DataSyncingBar } from 'widgets/src/components/refresh/DataSyncingBar';
import { Section } from 'widgets/src/components/section/Section';
import { SectionSeparator } from 'widgets/src/components/section/SectionSeparator';
import { EmojiLabel } from 'widgets/src/components/text/EmojiLabel';
import { TextStyleFont } from 'widgets/src/styles/TextStyleFont';
import { SemanticColor } from 'widgets/src/styles/semanticColors';
import { DemoPage } from '../DemoPage';

export class MotionDemo extends Component<{}> {
  onRender(): void {
    <DemoPage title='Text, Images & Motion'>
      <Section title='Typography'>
        <label value='TITLE_1' font={TextStyleFont.TITLE_1} />
        <label value='TITLE_2' font={TextStyleFont.TITLE_2} />
        <label value='TITLE_3' font={TextStyleFont.TITLE_3} />
        <label value='TITLE_4' font={TextStyleFont.TITLE_4} />
        <label value='BODY' font={TextStyleFont.BODY} />
        <label value='CAPTION' font={TextStyleFont.CAPTION} color={SemanticColor.Text.SECONDARY} />
      </Section>
      <SectionSeparator />
      <Section title='EmojiLabel'>
        <EmojiLabel value='🎉 Celebration!' font={TextStyleFont.TITLE_3} />
      </Section>
      <SectionSeparator />
      <Section title='Image assets'>
        <layout flexDirection='row' alignItems='center'>
          <image margin={5} height={32} width={32} src={res.iconEllipsis} tint={SemanticColor.Brand.PRIMARY} />
          <AnimationRotate revolutionPerSecond={1}>
            <image margin={5} height={32} width={32} src={res.iconQuestionMark} tint={SemanticColor.Brand.SECONDARY} />
          </AnimationRotate>
        </layout>
      </Section>
      <SectionSeparator />
      <Section title='AnimationShimmer'>
        <layout flexDirection='row'>
          <AnimationShimmer margin={5} width={48} height={48} borderRadius={24} />
          <layout flexGrow={1}>
            <AnimationShimmer margin={5} width={180} height={14} borderRadius={4} />
            <AnimationShimmer margin={5} width={120} height={14} borderRadius={4} />
          </layout>
        </layout>
      </Section>
      <SectionSeparator />
      <Section title='DataSyncingBar' fullBleed>
        <DataSyncingBar />
      </Section>
    </DemoPage>;
  }
}
