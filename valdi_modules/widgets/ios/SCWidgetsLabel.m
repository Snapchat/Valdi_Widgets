//
//  SCWidgetsLabel.m
//  Valdi
//
//  Created by Simon Corsin on 5/18/20.
//

#import "valdi/ios/Views/SCWidgetsLabel.h"
#import "valdi_core/SCValdiLogger.h"
#import "valdi_core/UIColor+Valdi.h"
#import "valdi/ios/Categories/UIView+Valdi.h"

#import "valdi/ios/Text/NSAttributedString+Valdi.h"
#import "valdi/ios/Text/SCValdiFontAttributes.h"
#import "valdi/ios/Text/SCValdiFont.h"
#import "valdi/ios/Text/SCValdiAttributedText.h"
#import "valdi/ios/Text/SCValdiTextLayout.h"
#import "valdi/ios/Text/SCValdiOnTapAttribute.h"
#import "valdi/ios/Text/SCValdiOnLayoutAttribute.h"
#import "valdi/ios/Utils/GradientUtils.h"
#import "valdi/ios/Gestures/SCValdiGestureRecognizers.h"

#import "valdi_core/SCMacros.h"
#import "valdi_core/SCValdiRectUtils.h"

static NSString *const kTextGradientLayoutKey = @"text_gradient";

@interface SCWidgetsLabel() <SCValdiAttributedTextOnTapGestureRecognizerFunctionProvider>

@end

@implementation SCWidgetsLabel {
    SCValdiTextLayout *_textLayout;
    SCValdiFontAttributes *_fontAttributes;
    id<SCValdiFontManagerProtocol> _fontManager;
    id _textValue;
    BOOL _needAttributedTextUpdate;
    SCValdiTextMode _labelMode;
    BOOL _hasOnTapGestureRecognizer;
    BOOL _needTextGradientColorUpdate;
    UIColor *_textGradientColor;
    CAGradientLayer *_textGradientLayer;
    BOOL _updateOnLayout;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];

    if (self) {
        self.shadowOffset = CGSizeMake(0, 0);
        self.userInteractionEnabled = YES;
        self.adjustsFontForContentSizeCategory = NO;
        _labelMode = SCValdiTextModeText;
    }

    return self;
}

- (void)valdi_applySlowClipping:(BOOL)slowClipping animator:(id<SCValdiAnimatorProtocol> )animator
{
    self.clipsToBounds = slowClipping;
}

- (void)layoutSubviews
{
    [self _updateTextGradientColorIfNeeded];
    [self _updateAttributedTextIfNeeded];
    [super layoutSubviews];
    _textLayout.size = self.bounds.size;

    // TODO(3065): Also update on view size changed
    if (_updateOnLayout) {
        // Everything has been layed out, Attributed text callbacks go here
        NSAttributedString *attributedString = (_textLayout) ? _textLayout.attributedString : self.attributedText;
        if (!attributedString) {
            return;
        }

        [attributedString enumerateAttribute:kSCValdiAttributedStringKeyOnLayout
                                                 inRange:NSMakeRange(0, attributedString.length)
                                                 options:NSAttributedStringEnumerationLongestEffectiveRangeNotRequired
                                              usingBlock:^(id  _Nullable value, NSRange range, BOOL * _Nonnull stop) {
                        if (value) {
                            SCValdiOnLayoutAttribute *attribute = value;
                            CGRect newBounds = [_textLayout boundingRectForRange:range];
                            SCValdiMarshallerScoped(marshaller, {
                                SCValdiMarshallerPushDouble(marshaller, CGFloatNormalize(newBounds.origin.x));
                                SCValdiMarshallerPushDouble(marshaller, CGFloatNormalize(newBounds.origin.y));
                                SCValdiMarshallerPushDouble(marshaller, CGFloatNormalize(newBounds.size.width));
                                SCValdiMarshallerPushDouble(marshaller, CGFloatNormalize(newBounds.size.height));
                                [attribute.callback performWithMarshaller:marshaller];
                            });
                        }
                    }];

        _updateOnLayout = NO;
    }
}

- (CGPoint)convertPoint:(CGPoint)point fromView:(UIView *)view
{
    return [self valdi_convertPoint:point fromView:view];
}

- (CGPoint)convertPoint:(CGPoint)point toView:(UIView *)view
{
    return [self valdi_convertPoint:point toView:view];
}

- (CGSize)sizeThatFits:(CGSize)size
{
    [self _updateAttributedTextIfNeeded];
    return [super sizeThatFits:size];
}

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event
{
    if (self.valdiHitTest != nil) {
        return [self valdi_hitTest:point withEvent:event withCustomHitTest:self.valdiHitTest];
    }
    return [super hitTest:point withEvent:event];
}

- (void)drawTextInRect:(CGRect)rect
{
    if (_textLayout) {
        [_textLayout drawInRect:rect];
    } else {
        [super drawTextInRect:rect];
    }
}

+ (CGSize)measureSizeWithMaxSize:(CGSize)maxSize
                  fontAttributes:(SCValdiFontAttributes *)fontAttributes
                     fontManager:(id<SCValdiFontManagerProtocol>)fontManager
                            text:(id)text
                 traitCollection:(UITraitCollection *)traitCollection
{
    if (!traitCollection) {
        SCLogValdiWarning(@"Trait collection is nil. This will cause incorrect text measurement for different font sizes");
    }

    if (!fontAttributes) {
        fontAttributes = [NSAttributedString defaultFontAttributes];
    }

    NSString *textValue = ObjectAs(text, NSString);
    if (!textValue && [text isKindOfClass:[NSNull class]]) {
        textValue = @"";
    }

    BOOL isRightToLeft = NO; // Hard-coding this to NO, as it may have no measurement impact either way (and NO is faster)

    NSDictionary<NSAttributedStringKey, id> *attributes = [fontAttributes resolveAttributesWithIsRightToLeft:isRightToLeft traitCollection:traitCollection];

    NSStringDrawingContext *context = [[NSStringDrawingContext alloc] init];
    [context setValue:@(fontAttributes.numberOfLines) forKey:@"maximumNumberOfLines"];

    NSStringDrawingOptions options = NSStringDrawingUsesLineFragmentOrigin | NSStringDrawingTruncatesLastVisibleLine;

    CGRect boundingRect;
    if (textValue) {
        boundingRect = [textValue boundingRectWithSize:maxSize options:options attributes:attributes context:context];
    } else {
        NSAttributedString *attributedString = [NSAttributedString attributedStringWithValdiText:text
                                                                                         attributes:attributes
                                                                                      isRightToLeft:isRightToLeft
                                                                                        fontManager:fontManager
                                                                                    traitCollection:traitCollection];
        boundingRect = [attributedString boundingRectWithSize:maxSize options:options context:context];
    }

    CGSize outSize = boundingRect.size;

    outSize.width = CGFloatNormalizeCeil(outSize.width);
    outSize.height = CGFloatNormalizeCeil(outSize.height);

    return outSize;
}

- (BOOL)_needAttributedString
{
    if (_fontAttributes.needAttributedString) {
        return YES;
    }

    if (_textValue && (![_textValue isKindOfClass:[NSString class]])) {
        return YES;
    }

    return NO;
}

- (id<SCValdiFunction>)onTapFunctionAtLocation:(CGPoint)location
{
    NSAttributedString *attributedString = _textLayout.attributedString;
    if (!attributedString) {
        return nil;
    }

    NSUInteger index = [_textLayout characterIndexAtPoint:location];
    if (index == NSNotFound || index >= attributedString.length) {
        return nil;
    }

    SCValdiOnTapAttribute *onTapAttribute = [attributedString
                                                attribute:kSCValdiAttributedStringKeyOnTap
                                                atIndex:index
                                                effectiveRange:nil];
    return onTapAttribute.callback;
}

- (SCValdiAttributedTextOnTapGestureRecognizer *)_getAttributedTextOnTapGestureRecognizer
{
    if (!_hasOnTapGestureRecognizer) {
        return nil;
    }

    for (UIGestureRecognizer *gestureRecognizer in self.gestureRecognizers) {
        SCValdiAttributedTextOnTapGestureRecognizer *attributedOnTapGestureRecognizer = ObjectAs(gestureRecognizer, SCValdiAttributedTextOnTapGestureRecognizer);
        if (attributedOnTapGestureRecognizer) {
            return attributedOnTapGestureRecognizer;
        }
    }

    return nil;
}

- (void)_removeAttributedTextOnTapGestureRecognizer
{
    SCValdiAttributedTextOnTapGestureRecognizer *attributedOnTapGestureRecognizer = [self _getAttributedTextOnTapGestureRecognizer];
    if (attributedOnTapGestureRecognizer) {
        _hasOnTapGestureRecognizer = NO;
        [self removeGestureRecognizer:attributedOnTapGestureRecognizer];
    }
}

- (void)_addAttributedTextOnTapGestureRecognizer
{
    SCValdiAttributedTextOnTapGestureRecognizer *attributedOnTapGestureRecognizer = [self _getAttributedTextOnTapGestureRecognizer];
    if (!attributedOnTapGestureRecognizer) {
        attributedOnTapGestureRecognizer = [[SCValdiAttributedTextOnTapGestureRecognizer alloc] init];
        _hasOnTapGestureRecognizer = YES;
        [self addGestureRecognizer:attributedOnTapGestureRecognizer];
        attributedOnTapGestureRecognizer.functionProvider = self;
    }
}

- (void)_updateAttributedTextIfNeeded
{
    if (_needAttributedTextUpdate) {
        _needAttributedTextUpdate = NO;

        BOOL isRightToLeft = self.valdiViewNode.isRightToLeft;
        UITraitCollection *traitCollection = self.valdiContext.traitCollection;

        SCValdiFontAttributes *fontAttributes = [self fontAttributes];

        if ([self _needAttributedString]) {
            NSAttributedString *attributedString = [NSAttributedString attributedStringWithValdiText:_textValue
                                                                                             attributes:[fontAttributes resolveAttributesWithIsRightToLeft:isRightToLeft traitCollection:traitCollection]
                                                                                          isRightToLeft:isRightToLeft
                                                                                            fontManager:_fontManager
                                                                                        traitCollection:traitCollection];

            __block BOOL hasOnTapAttribute = NO;
            [attributedString enumerateAttribute:kSCValdiAttributedStringKeyOnTap
                                         inRange:NSMakeRange(0, attributedString.length)
                                         options:NSAttributedStringEnumerationLongestEffectiveRangeNotRequired
                                      usingBlock:^(id  _Nullable value, NSRange range, BOOL * _Nonnull stop) {
                if (value) {
                    *stop = YES;
                    hasOnTapAttribute = YES;
                }
            }];

            __block BOOL hasOnLayoutAttribute = NO;
            [attributedString enumerateAttribute:kSCValdiAttributedStringKeyOnLayout
                                         inRange:NSMakeRange(0, attributedString.length)
                                         options:NSAttributedStringEnumerationLongestEffectiveRangeNotRequired
                                      usingBlock:^(id  _Nullable value, NSRange range, BOOL * _Nonnull stop) {
                if (value) {
                    *stop = YES;
                    hasOnLayoutAttribute = YES;
                }
            }];

            if (hasOnTapAttribute || hasOnLayoutAttribute) {
                [self updateLabelMode:SCValdiTextModeValdiTextLayout];
                _textLayout.attributedString = attributedString;
                [self setNeedsDisplay];
            } else {
                [self updateLabelMode:SCValdiTextModeAttributedText];

                self.attributedText = attributedString;
            }

            if (hasOnLayoutAttribute) {
                _updateOnLayout = YES;
            }

            if (hasOnTapAttribute) {
                [self _addAttributedTextOnTapGestureRecognizer];
            } else {
                [self _removeAttributedTextOnTapGestureRecognizer];
            }

        } else {
            // Can set without attributed text

            [self updateLabelMode:SCValdiTextModeText];
            [self _removeAttributedTextOnTapGestureRecognizer];

            UIFont *font = [fontAttributes.font resolveFontFromTraitCollection:traitCollection];
            if (self.font != font) {
                self.font = font;
            }

            if (self.textColor != fontAttributes.color) {
                self.textColor = fontAttributes.color;
            }

            NSTextAlignment resolvedTextAlignment = [fontAttributes resolveTextAlignmentWithIsRightToLeft:isRightToLeft];
            if (self.textAlignment != resolvedTextAlignment) {
                self.textAlignment = resolvedTextAlignment;
            }

            self.text = _textValue;
        }

        // Overrides color for attributed and non-attributed text if text gradient is specified
        if (_textGradientColor && self.textColor != _textGradientColor) {
            self.textColor = _textGradientColor;
        }

        if (self.numberOfLines != fontAttributes.numberOfLines) {
            self.numberOfLines = fontAttributes.numberOfLines;
        }

        // When rendering, we always set the label's lineBreakMode to lineBreakByTruncatingTail, even when the attributed text
        // has a different line break mode. This ensures the label still tries to fill out all available space
        // with text (if numberOfLines allows) and if the text doesn't fit - it renders a nice ellipsis at the end of the last visible line.
        if (fontAttributes.lineBreakMode == NSLineBreakByClipping) {
            self.lineBreakMode = NSLineBreakByClipping;
        } else {
            self.lineBreakMode = NSLineBreakByTruncatingTail;
        }
    }
}

- (BOOL)requiresLayoutWhenAnimatingBounds
{
    return NO;
}

- (SCValdiFontAttributes *)fontAttributes
{
    if (_fontAttributes) {
        return _fontAttributes;
    }
    return [NSAttributedString defaultFontAttributes];
}

- (void)valdi_setFontManager:(id<SCValdiFontManagerProtocol>)fontManager
{
    _fontManager = fontManager;
}

- (void)valdi_setFontAttributes:(SCValdiFontAttributes *)fontAttributes
{
    _fontAttributes = fontAttributes;
    _needAttributedTextUpdate = YES;
    [self setNeedsLayout];
}

- (void)valdi_setText:(id)textValue
{
    _textValue = textValue;
    _needAttributedTextUpdate = YES;
    [self setNeedsLayout];
}

- (BOOL)valdi_setTextGradient:(NSArray *)attributeValue
                        animator:(id<SCValdiAnimatorProtocol>)animator
{
    NSArray *colors = attributeValue.firstObject;

    // Error checking
    if (colors.count < 2) {
        [self.valdiViewNode setDidFinishLayoutBlock:nil forKey:kTextGradientLayoutKey];
        _textGradientLayer = nil;
        _needAttributedTextUpdate = YES;
        [self setNeedsDisplay];

        return YES;
    }

    _textGradientLayer = setUpGradientLayerForRawAttributes(attributeValue, nil);

    [self _updateTextGradientLayerWithAnimator:animator];

    [self.valdiViewNode setDidFinishLayoutBlock:^(SCWidgetsLabel *view, id<SCValdiAnimatorProtocol> animator) {
        [view _updateTextGradientLayerWithAnimator:animator];
    } forKey:kTextGradientLayoutKey];

    return YES;
}

- (void)valdi_layoutTextGradientLayerWithAnimator:(id<SCValdiAnimatorProtocol>)animator
{
    if (_textGradientLayer == nil) {
        return;
    }

    if (animator) {
        CGSize size = self.frame.size;
        CGPoint center = CGPointMake(size.width / 2, size.height / 2);
        [animator addAnimationOnLayer:_textGradientLayer forKeyPath:@"position" value:[NSValue valueWithCGPoint:center]];
        [animator addAnimationOnLayer:_textGradientLayer forKeyPath:@"bounds" value:[NSValue valueWithCGRect:CGRectMake(0, 0, size.width, size.height)]];
    } else {
        _textGradientLayer.frame = self.layer.bounds;
    }
}

- (void)_updateTextGradientColorIfNeeded
{
    if (!_needTextGradientColorUpdate) {
        return;
    } else if (_textGradientLayer == nil) {
        _needTextGradientColorUpdate = NO;
        _textGradientColor = nil;
        return;
    }

    UIGraphicsBeginImageContext(_textGradientLayer.bounds.size);
    [_textGradientLayer renderInContext:UIGraphicsGetCurrentContext()];

    UIImage *gradientImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();

    UIColor *gradientColor = [UIColor colorWithPatternImage:gradientImage];

    _textGradientColor = gradientColor;
    _needTextGradientColorUpdate = NO;
}

- (void)_updateTextGradientLayerWithAnimator:(id<SCValdiAnimatorProtocol>)animator
{
    if (_textGradientLayer == nil || CGRectEqualToRect(_textGradientLayer.frame, self.layer.bounds)) {
        return;
    }

    [self valdi_layoutTextGradientLayerWithAnimator:animator];

    _needTextGradientColorUpdate = YES;
    _needAttributedTextUpdate = YES;
    [self setNeedsDisplay];
}

+ (CGSize)valdi_onMeasureWithAttributes:(id<SCValdiViewLayoutAttributes>)attributes
                                   maxSize:(CGSize)maxSize
                               fontManager:(id<SCValdiFontManagerProtocol>)fontManager
                           traitCollection:(UITraitCollection *)traitCollection
{
    SCValdiFontAttributes *fontAttributes = ObjectAs([attributes valueForAttributeName:@"fontSpecs"], SCValdiFontAttributes);
    id text = [attributes valueForAttributeName:@"value"];

    return [SCWidgetsLabel measureSizeWithMaxSize:maxSize
                                    fontAttributes:fontAttributes
                                        fontManager:fontManager
                                              text:text
                                   traitCollection:traitCollection];
}

+ (void)bindAttributes:(id<SCValdiAttributesBinderProtocol>)attributesBinder
{
    id<SCValdiFontManagerProtocol> fontManager = [attributesBinder fontManager];

    [attributesBinder bindCompositeAttribute:@"fontSpecs" parts:[NSAttributedString valdiFontAttributes] withUntypedBlock:^BOOL(__kindof SCWidgetsLabel *view, id attributeValue, id<SCValdiAnimatorProtocol> animator) {
        [view valdi_setFontManager:fontManager];
        [view valdi_setFontAttributes:ObjectAs(attributeValue, SCValdiFontAttributes)];
        return YES;
    } resetBlock:^(SCWidgetsLabel *view, id<SCValdiAnimatorProtocol> animator) {
        [view valdi_setFontAttributes:nil];
    }];

    [attributesBinder bindAttribute:@"value" invalidateLayoutOnChange:YES withTextBlock:^BOOL(SCWidgetsLabel *view, id attributeValue, id<SCValdiAnimatorProtocol> animator) {
        [view valdi_setFontManager:fontManager];
        [view valdi_setText:attributeValue];
        return YES;
    } resetBlock:^(SCWidgetsLabel *view, id<SCValdiAnimatorProtocol> animator) {
        [view valdi_setText:nil];
    }];

    [attributesBinder registerPreprocessorForAttribute:@"font" enableCache:YES withBlock:^id(id value) {
        return [SCValdiFont fontFromValdiAttribute:ObjectAs(value, NSString) fontManager:fontManager];
    }];

    [attributesBinder registerPreprocessorForAttribute:@"fontSpecs" enableCache:YES withBlock:^id(id value) {
        return [NSAttributedString fontAttributesWithCompositeValue:value];
    }];

    [attributesBinder bindAttribute:@"adjustsFontSizeToFitWidth"
        invalidateLayoutOnChange:YES
        withBoolBlock:^BOOL(UILabel *label, BOOL attributeValue, id<SCValdiAnimatorProtocol> animator) {
            label.adjustsFontSizeToFitWidth = attributeValue;
            return YES;
        }
        resetBlock:^(UILabel *label, id<SCValdiAnimatorProtocol> animator) {
            label.adjustsFontSizeToFitWidth = NO;
        }];

    [attributesBinder bindAttribute:@"minimumScaleFactor"
        invalidateLayoutOnChange:YES
        withDoubleBlock:^BOOL(UILabel *label, CGFloat attributeValue, id<SCValdiAnimatorProtocol> animator) {
            label.minimumScaleFactor = attributeValue;
            return YES;
        }
        resetBlock:^(UILabel *label, id<SCValdiAnimatorProtocol> animator) {
            label.minimumScaleFactor = 0;
        }];

    [attributesBinder bindAttribute:@"textGradient"
        invalidateLayoutOnChange:NO
        withArrayBlock:^BOOL(SCWidgetsLabel *view, NSArray *attributeValue, id<SCValdiAnimatorProtocol> animator) {
            return [view valdi_setTextGradient:attributeValue animator:animator];
        }
        resetBlock:^(SCWidgetsLabel *view, id<SCValdiAnimatorProtocol> animator) {
            [view valdi_setTextGradient:@[] animator:animator];
        }];

    [attributesBinder bindCompositeAttribute:@"shadowAttributes"
                                       parts:[self _valdiShadowComponents]
                            withUntypedBlock:^BOOL(SCWidgetsLabel *label, id attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSArray *attributeValueArray = ObjectAs(attributeValue, NSArray);
        if (attributeValueArray.count != 2) {
            return NO;
        }

        NSArray<id> *textShadow = ObjectAs(attributeValueArray[0], NSArray);
        NSArray<id> *boxShadow = ObjectAs(attributeValueArray[1], NSArray);

        if (textShadow != nil && boxShadow != nil) {
            SCLogValdiError(@"Combining boxShadow and textShadow on the same label is not currently supported.");
            return NO;
        }

        if (boxShadow != nil) {
            return [label valdi_setBoxShadow:boxShadow animator:animator];
        } else {
            label.layer.shadowPath = nil;
        }

        return SCValdiSetTextHolderTextShadow(label, textShadow);
    }
        resetBlock:^(SCWidgetsLabel *label, id<SCValdiAnimatorProtocol> animator) {
            SCValdiResetTextHolderTextShadow(label);
    }];

    [attributesBinder setMeasureDelegate:^CGSize(id<SCValdiViewLayoutAttributes> attributes, CGSize maxSize, UITraitCollection *traitCollection) {
        return [SCWidgetsLabel valdi_onMeasureWithAttributes:attributes maxSize:maxSize fontManager:fontManager traitCollection:traitCollection];
    }];
}

+ (NSArray<SCNValdiCoreCompositeAttributePart *> *)_valdiShadowComponents
{
    return @[
             [[SCNValdiCoreCompositeAttributePart alloc] initWithAttribute:@"textShadow"
                                                                     type:SCNValdiCoreAttributeTypeUntyped
                                                                 optional:YES
                                                 invalidateLayoutOnChange:NO],
             [[SCNValdiCoreCompositeAttributePart alloc] initWithAttribute:@"boxShadow"
                                                                     type:SCNValdiCoreAttributeTypeUntyped
                                                                 optional:YES
                                                 invalidateLayoutOnChange:NO],
             ];
}

- (void)updateLabelMode:(SCValdiTextMode)labelMode
{
    if (_labelMode == labelMode) {
        return;
    }

    // Cleanup
    switch (_labelMode) {
        case SCValdiTextModeText:
            self.text = nil;
            break;
        case SCValdiTextModeAttributedText:
            [self _clearAttributedText];
            break;
        case SCValdiTextModeValdiTextLayout:
            _textLayout = nil;
            [self setNeedsDisplay];
            break;
    }

    // Setup
    _labelMode = labelMode;

    switch (labelMode) {
        case SCValdiTextModeText:
            break;
        case SCValdiTextModeAttributedText:
            break;
        case SCValdiTextModeValdiTextLayout:
            _textLayout = [SCValdiTextLayout new];
            _textLayout.size = self.bounds.size;
            [self setNeedsDisplay];
            break;
    }
}

- (void)_clearAttributedText
{
    // There's a UIKit bug, where the label caches a set of "default attributes"
    // based on the `attributedText` that was previously set on it. Setting `attributedText`
    // to nil does not seem to clear the paragraphStyle from these cached attributes.
    // Calling the private API -[UILabel _setDefaultAttributes:nil] seem to help,
    // but in the interest of avoiding using a private system API we looked for an
    // alternative approach.
    //
    // Setting an attributed string value with an explicit default paragraph style,
    // then setting a nil `text` before setting a nil `attributedText` seems to do it.
    static dispatch_once_t onceToken;
    static NSAttributedString *cleanupAttributedString;
    dispatch_once(&onceToken, ^{
        NSDictionary *cleanupAttributes = @{
            NSParagraphStyleAttributeName: NSParagraphStyle.defaultParagraphStyle
        };
        // This doesn't seem to work correctly with an empty string value
        cleanupAttributedString = [[NSAttributedString alloc] initWithString:@"-"
                                                                  attributes:cleanupAttributes];
    });
    self.attributedText = cleanupAttributedString;
    self.text = nil;

    self.attributedText = nil;
}

- (BOOL)willEnqueueIntoValdiPool
{
    if (_labelMode != SCValdiTextModeText) {
        [self updateLabelMode:SCValdiTextModeText];
        _needAttributedTextUpdate = YES;
    }

    return self.class == [SCWidgetsLabel class];
}

- (NSString *)accessibilityLabel
{
    if (_labelMode == SCValdiTextModeValdiTextLayout) {
        return [_textLayout.attributedString string];
    }

    return [super accessibilityLabel];
}

- (UIAccessibilityTraits)accessibilityTraits
{
    UIAccessibilityTraits traits = [super accessibilityTraits];

    /* UILabel adds button when the text is empty, which we don't want */
    traits &= ~UIAccessibilityTraitButton;
    traits |= UIAccessibilityTraitStaticText;

    return traits;
}

@end
