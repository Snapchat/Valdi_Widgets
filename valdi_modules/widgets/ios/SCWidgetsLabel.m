//
//  SCWidgetsLabel.m
//  Valdi_Widgets
//

#import "SCWidgetsLabel.h"

#import "valdi_core/SCValdiAttributesBinderBase.h"

static UIFont *SCWidgetsResolveFont(NSString *str) {
    if (![str isKindOfClass:[NSString class]]) return nil;
    NSArray *parts = [str componentsSeparatedByString:@" "];
    if (parts.count < 2) return nil;
    NSString *name = parts[0];
    CGFloat size = [parts[1] doubleValue];
    if ([name isEqualToString:@"system-bold"]) {
        return [UIFont boldSystemFontOfSize:size];
    }
    if ([name isEqualToString:@"system"]) {
        return [UIFont systemFontOfSize:size];
    }
    return [UIFont fontWithName:name size:size];
}

@implementation SCWidgetsLabel

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        self.shadowOffset = CGSizeMake(0, 0);
        self.userInteractionEnabled = YES;
        self.adjustsFontForContentSizeCategory = NO;
    }
    return self;
}

- (UIAccessibilityTraits)accessibilityTraits
{
    UIAccessibilityTraits traits = [super accessibilityTraits];
    traits &= ~UIAccessibilityTraitButton;
    traits |= UIAccessibilityTraitStaticText;
    return traits;
}

#pragma mark - Static methods

+ (void)bindAttributes:(id<SCValdiAttributesBinderProtocol>)attributesBinder
{
    [attributesBinder bindAttribute:@"value"
           invalidateLayoutOnChange:YES
                    withStringBlock:^BOOL(SCWidgetsLabel *view, NSString *attributeValue, id<SCValdiAnimatorProtocol> animator) {
        view.text = attributeValue;
        return YES;
    } resetBlock:^(SCWidgetsLabel *view, id<SCValdiAnimatorProtocol> animator) {
        view.text = nil;
    }];

    [attributesBinder bindAttribute:@"color"
           invalidateLayoutOnChange:NO
                     withColorBlock:^BOOL(SCWidgetsLabel *view, UIColor *attributeValue, id<SCValdiAnimatorProtocol> animator) {
        view.textColor = attributeValue;
        return YES;
    }
                         resetBlock:^(SCWidgetsLabel *view, id<SCValdiAnimatorProtocol> animator) {
        view.textColor = [UIColor labelColor];
    }];

    [attributesBinder bindAttribute:@"font"
           invalidateLayoutOnChange:YES
                    withUntypedBlock:^BOOL(SCWidgetsLabel *view, id attributeValue, id<SCValdiAnimatorProtocol> animator) {
        UIFont *font = SCWidgetsResolveFont(attributeValue);
        view.font = font ?: [UIFont systemFontOfSize:[UIFont systemFontSize]];
        return YES;
    } resetBlock:^(SCWidgetsLabel *view, id<SCValdiAnimatorProtocol> animator) {
        view.font = [UIFont systemFontOfSize:[UIFont systemFontSize]];
    }];

    [attributesBinder bindAttribute:@"numberOfLines"
           invalidateLayoutOnChange:YES
                       withIntBlock:^BOOL(SCWidgetsLabel *view, NSInteger attributeValue, id<SCValdiAnimatorProtocol> animator) {
        view.numberOfLines = attributeValue;
        return YES;
    } resetBlock:^(SCWidgetsLabel *view, id<SCValdiAnimatorProtocol> animator) {
        view.numberOfLines = 1;
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

    [attributesBinder setPlaceholderViewMeasureDelegate:^UIView *{
        return [SCWidgetsLabel new];
    }];
}

@end
