//
//  SCWidgetsDatePicker.m
//  Valdi_Widgets
//

#import "SCWidgetsDatePicker.h"
#import "SCWidgetsDatePickerUtils.h"

#import "valdi_core/SCValdiAttributesBinderBase.h"
#import "valdi_core/SCValdiFunction.h"
#import "valdi_core/SCValdiMarshaller.h"

@implementation SCWidgetsDatePicker {
    id<SCValdiFunction> _Nullable _onChange;
}

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        self.datePickerMode = UIDatePickerModeDate;
        SCWidgetsFixIOS14DatePicker(self);
        [self addTarget:self action:@selector(_handleOnChange) forControlEvents:UIControlEventValueChanged];
    }
    return self;
}

- (CGSize)sizeThatFits:(CGSize)size
{
    if (@available(iOS 13.4, *)) {
        if (self.preferredDatePickerStyle == UIDatePickerStyleCompact) {
            CGSize fittingSize = [self systemLayoutSizeFittingSize:UILayoutFittingCompressedSize
                                    withHorizontalFittingPriority:UILayoutPriorityFittingSizeLevel
                                          verticalFittingPriority:UILayoutPriorityFittingSizeLevel];
            if (fittingSize.width > 0 && fittingSize.height > 0) {
                return fittingSize;
            }
        }
    }
    return [super sizeThatFits:size];
}

#pragma mark - Internal methods

- (void)_handleOnChange
{
    if (!_onChange) {
        return;
    }

    NSTimeInterval dateSeconds = self.date.timeIntervalSince1970;
    SCValdiMarshallerScoped(marshaller, {
        NSInteger objectIndex = SCValdiMarshallerPushMap(marshaller, 1);
        SCValdiMarshallerPushDouble(marshaller, dateSeconds);
        SCValdiMarshallerPutMapPropertyUninterned(marshaller, @"dateSeconds", objectIndex);

        [_onChange performWithMarshaller:marshaller];
    });
}

#pragma mark - Static methods

+ (void)bindAttributes:(id<SCValdiAttributesBinderProtocol>)attributesBinder {
    [attributesBinder bindAttribute:@"dateSeconds"
           invalidateLayoutOnChange:NO
                    withDoubleBlock:^BOOL(SCWidgetsDatePicker *view, CGFloat attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSDate *date = [NSDate dateWithTimeIntervalSince1970:attributeValue];
        BOOL animated = animator != nil;
        [view setDate:date animated:animated];
        return YES;
    } resetBlock:^(SCWidgetsDatePicker *view, id<SCValdiAnimatorProtocol> animator) {
        BOOL animated = animator != nil;
        [view setDate:[NSDate date] animated:animated];
    }];

    [attributesBinder bindAttribute:@"minimumDateSeconds"
           invalidateLayoutOnChange:NO
                    withDoubleBlock:^BOOL(SCWidgetsDatePicker *view, CGFloat attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSDate *minDate = [NSDate dateWithTimeIntervalSince1970:attributeValue];
        view.minimumDate = minDate;
        return YES;
    } resetBlock:^(SCWidgetsDatePicker *view, id<SCValdiAnimatorProtocol> animator) {
        view.minimumDate = nil;
    }];

    [attributesBinder bindAttribute:@"maximumDateSeconds"
           invalidateLayoutOnChange:NO
                    withDoubleBlock:^BOOL(SCWidgetsDatePicker *view, CGFloat attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSDate *maxDate = [NSDate dateWithTimeIntervalSince1970:attributeValue];
        view.maximumDate = maxDate;
        return YES;
    } resetBlock:^(SCWidgetsDatePicker *view, id<SCValdiAnimatorProtocol> animator) {
        view.maximumDate = nil;
    }];

    [attributesBinder bindAttribute:@"onChange"
                  withFunctionBlock:^(SCWidgetsDatePicker *view, id<SCValdiFunction> attributeValue) {
        view->_onChange = attributeValue;
    }
                         resetBlock:^(SCWidgetsDatePicker *view) {
        view->_onChange = nil;
    }];

    [attributesBinder bindAttribute:@"color"
           invalidateLayoutOnChange:NO
                     withColorBlock:^BOOL(SCWidgetsDatePicker *view, UIColor *attributeValue, id<SCValdiAnimatorProtocol> animator) {
        [view setValue:attributeValue forKey:@"textColor"];
        [view setValue:@(NO) forKey:@"highlightsToday"];
        return YES;
    }
                         resetBlock:^(SCWidgetsDatePicker *view, id<SCValdiAnimatorProtocol> animator) {
        [view setValue:nil forKey:@"textColor"];
    }];

    [attributesBinder bindAttribute:@"preferredStyle"
           invalidateLayoutOnChange:YES
                       withIntBlock:^BOOL(SCWidgetsDatePicker *view, NSInteger attributeValue, id<SCValdiAnimatorProtocol> animator) {
        SCWidgetsSetDatePickerStyle(view, attributeValue);
        return YES;
    } resetBlock:^(SCWidgetsDatePicker *view, id<SCValdiAnimatorProtocol> animator) {
        SCWidgetsSetDatePickerStyle(view, 1 /* wheels */);
    }];

    [attributesBinder setPlaceholderViewMeasureDelegate:^UIView *{
        return [SCWidgetsDatePicker new];
    }];
}

@end
