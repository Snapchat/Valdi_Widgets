import { Component } from 'valdi_core/src/Component';
import { AttributedTextBuilder } from 'valdi_core/src/utils/AttributedTextBuilder';
import { StringMap } from 'coreutils/src/StringMap';
import { LabelTextAlign, LayoutJustifyContentProperty } from 'valdi_tsx/src/NativeTemplateElements';
import { TextWithTagsChunk } from './TextWithTagsChunk';
import { TextWithTagsStyle } from './TextWithTagsStyle';

export enum TextWithTagsAlignment {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export interface TextWithTagsViewModel {
  /**
   * Parsed through makeChunksFromString(translatedXmlString)
   */
  chunks: TextWithTagsChunk[];
  /**
   * Mapping describing the styling of tags, indexed by their keys
   */
  tagsByKey: StringMap<TextWithTagsStyle>;
  /**
   * Base text styling
   */
  baseStyle: TextWithTagsStyle;
  /**
   * Misc setup
   */
  alignment?: TextWithTagsAlignment;
  /**
   * Disable rendering using AttributedText.
   */
  disallowAttributedTextRendering?: boolean;

  /**
   * This property controls the maximum number of lines
   * To remove any maximum limit, and use as many lines as needed, set the value of this property to 0.
   * @default: 0
   */
  numberOfLines?: number;
}

/**
 * Use this component to render text that contains multiple parts that are styled differently
 * (See examples in TextWithTagsDemo.tsx for getting started)
 *
 * Note: we offer 2 types of rendering (choose using disallowAttributedTextRendering = true/false)
 *  - (default) attributed text has more correct line-breaks, but does not support accessibilityId or letterSpacing.
 *  - regular rendering supports everything, but each chunk is rendered as a separate <label>s,
 *        potentially causing bad line break behaviour.
 */
export class TextWithTags extends Component<TextWithTagsViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    const alignment = viewModel.alignment;
    const justifyContent = alignment ? alignmentToJustifyContent[alignment] : undefined;
    <layout flexDirection='row' flexWrap='wrap' justifyContent={justifyContent}>
      {this.onRenderRouting()}
    </layout>;
  }

  private needsMultipleLabels(): boolean {
    const viewModel = this.viewModel;
    if (viewModel.disallowAttributedTextRendering) {
      return true;
    }
    for (const chunk of viewModel.chunks) {
      const tagStyle = this.getTagStyle(chunk.key);
      if (!tagStyle) {
        continue;
      }
      if (tagStyle.accessibilityId || tagStyle.letterSpacing) {
        return true;
      }
    }

    return false;
  }

  /**
   * If the user opt-in for attributed text rendering,
   * we check if it's possible to render using AttributedTextBuilder
   * AttributedTextBuilder does not yet support those attributes:
   *  - letterSpacing
   *  - accessibilityId
   * So we check if multiple of those attributes are present,
   * and we fallback to multiple-label rendering if anything is unsupported
   */
  private onRenderRouting(): void {
    if (this.needsMultipleLabels()) {
      this.onRenderTextUsingMultipleLabels();
    } else {
      this.onRenderTextUsingAttributedText();
    }
  }

  /**
   * If the rendering is complicated, we use a multi-label approach.
   * The trade off is:
   * - Multi labels support 100% of the feature-set (mutliple font/accessibilityId etc)
   * - Line breaks are quite terrible as flexbox is not a text layout engine
   */
  private onRenderTextUsingMultipleLabels(): void {
    const viewModel = this.viewModel;
    const baseStyle = viewModel.baseStyle;
    for (const chunk of viewModel.chunks) {
      const tagStyle = this.getTagStyle(chunk.key);
      if (chunk.text) {
        <label
          value={chunk.text}
          accessibilityId={tagStyle?.accessibilityId}
          font={tagStyle?.font ?? baseStyle?.font}
          color={tagStyle?.color ?? baseStyle?.color}
          textDecoration={tagStyle?.textDecoration ?? baseStyle?.textDecoration}
          onTap={tagStyle?.onTap ?? baseStyle?.onTap}
          textAlign={this.getTextAlign()}
          numberOfLines={this.numberOfLines()}
          letterSpacing={tagStyle?.letterSpacing ?? baseStyle.letterSpacing}
        />;
      }
    }
  }

  /**
   * If the user opt-in and also uses a sub-set of all the features available,
   * we can use attributed text rendering.
   *
   * The trade-off is:
   * - AttributedTextBuilder line breaks will be very good, and quite readable
   * - AttributedTextBuilder will probably never support accessibilityId
   */
  private onRenderTextUsingAttributedText(): void {
    const viewModel = this.viewModel;
    const attributedTextBuilder = new AttributedTextBuilder();
    for (const chunk of viewModel.chunks) {
      const tagStyle = this.getTagStyle(chunk.key);
      if (tagStyle) {
        attributedTextBuilder.append(chunk.text, {
          font: tagStyle.font,
          color: tagStyle.color,
          textDecoration: tagStyle.textDecoration,
          onTap: tagStyle.onTap,
        });
      } else {
        attributedTextBuilder.appendText(chunk.text);
      }
    }

    const baseStyle = viewModel.baseStyle;

    <label
      value={attributedTextBuilder.build()}
      color={baseStyle.color}
      textDecoration={baseStyle.textDecoration}
      font={baseStyle.font}
      accessibilityId={baseStyle.accessibilityId}
      onTap={baseStyle.onTap}
      textAlign={this.getTextAlign()}
      numberOfLines={this.numberOfLines()}
      letterSpacing={baseStyle.letterSpacing}
    />;
  }

  /**
   * Read the style object for a specific chunk, if available
   */
  private getTagStyle(key?: string): TextWithTagsStyle | undefined {
    if (key) {
      const tagStyle = this.viewModel.tagsByKey[key];
      if (!tagStyle) {
        console.error("Xml string's tag was not found in the tagsByKey mapping", key);
      }
      return tagStyle;
    }
    return undefined;
  }

  /**
   * Read the label's textAlign
   */
  private getTextAlign(): LabelTextAlign | undefined {
    const alignment = this.viewModel.alignment;
    return alignment ? alignmentToTextAlign[alignment] : undefined;
  }

  /**
   * Read the numberOfLines property
   */
  private numberOfLines(): number {
    return this.viewModel.numberOfLines ? this.viewModel.numberOfLines : 0;
  }
}

const alignmentToJustifyContent: { [alignment in TextWithTagsAlignment]: LayoutJustifyContentProperty } = {
  [TextWithTagsAlignment.Left]: 'flex-start',
  [TextWithTagsAlignment.Center]: 'center',
  [TextWithTagsAlignment.Right]: 'flex-end',
};
const alignmentToTextAlign: { [alignment in TextWithTagsAlignment]: LabelTextAlign } = {
  [TextWithTagsAlignment.Left]: 'left',
  [TextWithTagsAlignment.Center]: 'center',
  [TextWithTagsAlignment.Right]: 'right',
};
