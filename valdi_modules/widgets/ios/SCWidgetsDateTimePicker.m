#import "SCWidgetsDateTimePicker.h"
#import "SCWidgetsDatePickerUtils.h"

#import "valdi_core/SCValdiAttributesBinderBase.h"
#import "valdi_core/SCValdiFunction.h"
#import "valdi_core/SCValdiMarshaller.h"

@implementation SCWidgetsDateTimePicker {
    id<SCValdiFunction> _Nullable _onChange;
}

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        self.datePickerMode = UIDatePickerModeDateAndTime;
        SCWidgetsFixIOS14DatePicker(self);
        [self addTarget:self action:@selector(_handleOnChange) forControlEvents:UIControlEventValueChanged];
    }
    return self;
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
                    withDoubleBlock:^BOOL(SCWidgetsDateTimePicker *view, CGFloat attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSDate *date = [NSDate dateWithTimeIntervalSince1970:attributeValue];
        BOOL animated = animator != nil;
        [view setDate:date animated:animated];
        return YES;
    } resetBlock:^(SCWidgetsDateTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
        BOOL animated = animator != nil;
        [view setDate:[NSDate date] animated:animated];
    }];

    [attributesBinder bindAttribute:@"minimumDateSeconds"
           invalidateLayoutOnChange:NO
                    withDoubleBlock:^BOOL(SCWidgetsDateTimePicker *view, CGFloat attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSDate *minDate = [NSDate dateWithTimeIntervalSince1970:attributeValue];
        view.minimumDate = minDate;
        return YES;
    } resetBlock:^(SCWidgetsDateTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
        view.minimumDate = nil;
    }];

    [attributesBinder bindAttribute:@"maximumDateSeconds"
           invalidateLayoutOnChange:NO
                    withDoubleBlock:^BOOL(SCWidgetsDateTimePicker *view, CGFloat attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSDate *maxDate = [NSDate dateWithTimeIntervalSince1970:attributeValue];
        view.maximumDate = maxDate;
        return YES;
    } resetBlock:^(SCWidgetsDateTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
        view.maximumDate = nil;
    }];

    [attributesBinder bindAttribute:@"onChange"
                  withFunctionBlock:^(SCWidgetsDateTimePicker *view, id<SCValdiFunction> attributeValue) {
        view->_onChange = attributeValue;
    }
                         resetBlock:^(SCWidgetsDateTimePicker *view) {
        view->_onChange = nil;
    }];

    [attributesBinder setPlaceholderViewMeasureDelegate:^UIView *{
        return [SCWidgetsDateTimePicker new];
    }];
}

@end
