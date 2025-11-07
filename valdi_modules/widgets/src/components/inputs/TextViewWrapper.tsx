import { TextView } from 'valdi_tsx/src/NativeTemplateElements';
import { TextInputWrapper } from './TextInputWrapper';

type TextViewPassthroughAttributes =
  | 'style'
  | 'placeholder'
  | 'placeholderColor'
  | 'value'
  | 'font'
  | 'color'
  | 'tintColor'
  | 'onChange'
  | 'onWillChange'
  | 'onEditBegin'
  | 'onEditEnd'
  | 'onReturn'
  | 'onWillDelete'
  | 'selectTextOnFocus'
  | 'textAlign'
  | 'textGravity'
  | 'width'
  | 'minWidth'
  | 'maxWidth'
  | 'height'
  | 'minHeight'
  | 'maxHeight'
  | 'flexGrow'
  | 'flexShrink'
  | 'borderRadius'
  | 'backgroundColor'
  | 'opacity'
  | 'accessibilityId'
  | 'accessibilityLabel'
  | 'autocapitalization'
  | 'autocorrection'
  | 'characterLimit'
  | 'returnType'
  | 'closesWhenReturnKeyPressed'
  | 'touchAreaExtension'
  | 'enabled'
  | 'keyboardAppearance'
  | 'selection'
  | 'onSelectionChange'
  | 'textShadow';

export type TextViewWrapperViewModel = Pick<TextView, TextViewPassthroughAttributes>;

/**
 * This component acts as a drop-in replacement for the <textview/> element but also adds functionality:
 *
 * If configured, the textview will auto-scroll to center itself on the screen
 * when the keyboard appear and occludes the typing box
 *
 * NOTE:
 * behaviour will be different on android if the
 * Activity:windowSoftInputMode value is set to anything other than "Nothing"
 * This is because android will already handle the keyboard's apparition logic in this case
 * and we will no-op here to avoid conflicting bevahiour
 */
export class TextViewWrapper extends TextInputWrapper<TextViewWrapperViewModel> {
  onRender(): void {
    const viewModel = this.viewModel;
    <textview
      ref={this.textInputHandler}
      onEditBegin={this.onEditBegin}
      onEditEnd={this.onEditEnd}
      onLayout={this.onLayout}
      style={viewModel.style}
      placeholder={viewModel.placeholder}
      placeholderColor={viewModel.placeholderColor}
      value={viewModel.value}
      font={viewModel.font}
      color={viewModel.color}
      tintColor={viewModel.tintColor}
      onChange={viewModel.onChange}
      onWillChange={viewModel.onWillChange}
      onReturn={viewModel.onReturn}
      onWillDelete={viewModel.onWillDelete}
      selectTextOnFocus={viewModel.selectTextOnFocus}
      textAlign={viewModel.textAlign}
      width={viewModel.width}
      minWidth={viewModel.minWidth}
      maxWidth={viewModel.maxWidth}
      height={viewModel.height}
      minHeight={viewModel.minHeight}
      maxHeight={viewModel.maxHeight}
      flexGrow={viewModel.flexGrow}
      flexShrink={viewModel.flexShrink}
      borderRadius={viewModel.borderRadius}
      backgroundColor={viewModel.backgroundColor}
      opacity={viewModel.opacity}
      accessibilityId={viewModel.accessibilityId}
      accessibilityLabel={viewModel.accessibilityLabel}
      autocapitalization={viewModel.autocapitalization}
      autocorrection={viewModel.autocorrection}
      characterLimit={viewModel.characterLimit}
      returnType={viewModel.returnType}
      closesWhenReturnKeyPressed={viewModel.closesWhenReturnKeyPressed}
      touchAreaExtension={viewModel.touchAreaExtension}
      enabled={viewModel.enabled}
      keyboardAppearance={viewModel.keyboardAppearance}
      textGravity={viewModel.textGravity}
      selection={viewModel.selection}
      onSelectionChange={viewModel.onSelectionChange}
      textShadow={viewModel.textShadow}
    />;
  }
}
