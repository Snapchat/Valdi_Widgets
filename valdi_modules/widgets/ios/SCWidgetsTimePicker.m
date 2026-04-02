//
//  SCWidgetsTimePicker.m
//  Valdi_Widgets
//

#import "SCWidgetsTimePicker.h"
#import "SCWidgetsDatePickerUtils.h"

#import "valdi_core/SCValdiAttributesBinderBase.h"
#import "valdi_core/SCValdiFunction.h"
#import "valdi_core/SCValdiMarshaller.h"

@implementation SCWidgetsTimePicker {
    id<SCValdiFunction> _Nullable _onChange;
}

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        self.datePickerMode = UIDatePickerModeTime;
        NSCalendar *calendar = [[NSCalendar currentCalendar] copy];
        calendar.timeZone = [NSTimeZone timeZoneWithName:@"UTC"];
        self.calendar = calendar;
        self.timeZone = self.calendar.timeZone;
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

    NSDateComponents *components = [self.calendar components:(NSCalendarUnitHour | NSCalendarUnitMinute)
                                                    fromDate:self.date];
    NSInteger hourOfDay = components.hour;
    NSInteger minuteOfHour = components.minute;

    SCValdiMarshallerScoped(marshaller, {
        NSInteger objectIndex = SCValdiMarshallerPushMap(marshaller, 2);
        SCValdiMarshallerPushInt(marshaller, (int32_t)hourOfDay);
        SCValdiMarshallerPutMapPropertyUninterned(marshaller, @"hourOfDay", objectIndex);
        SCValdiMarshallerPushInt(marshaller, (int32_t)minuteOfHour);
        SCValdiMarshallerPutMapPropertyUninterned(marshaller, @"minuteOfHour", objectIndex);

        [_onChange performWithMarshaller:marshaller];
    });
}

- (NSDate *)_dateFromDate:(NSDate *)baseDate withCalendarComponent:(NSCalendarUnit)component setTo:(NSInteger)value
{
    NSCalendar *calendar = self.calendar;
    NSDateComponents *hourMinuteComponents = [calendar components:NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond fromDate:baseDate];
    [hourMinuteComponents setValue:value forComponent:component];
    NSDate *newDate = [calendar dateBySettingHour:hourMinuteComponents.hour
                                           minute:hourMinuteComponents.minute
                                           second:hourMinuteComponents.second
                                           ofDate:baseDate
                                          options:0];

    if (newDate == nil) {
        newDate = [NSDate date];
    }

    return newDate;
}

#pragma mark - Static methods

+ (void)bindAttributes:(id<SCValdiAttributesBinderProtocol>)attributesBinder {
    [attributesBinder bindAttribute:@"hourOfDay"
           invalidateLayoutOnChange:NO
                    withIntBlock:^BOOL(SCWidgetsTimePicker *view, NSInteger attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSDate *date = [view _dateFromDate:view.date withCalendarComponent:NSCalendarUnitHour setTo:attributeValue];
        BOOL animated = animator != nil;
        [view setDate:date animated:animated];
        return YES;
    } resetBlock:^(SCWidgetsTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
        NSDate *date = [view _dateFromDate:view.date withCalendarComponent:NSCalendarUnitHour setTo:9];
        BOOL animated = animator != nil;
        [view setDate:date animated:animated];
    }];

    [attributesBinder bindAttribute:@"minuteOfHour"
           invalidateLayoutOnChange:NO
                    withIntBlock:^BOOL(SCWidgetsTimePicker *view, NSInteger attributeValue, id<SCValdiAnimatorProtocol> animator) {
        NSDate *date = [view _dateFromDate:view.date withCalendarComponent:NSCalendarUnitMinute setTo:attributeValue];
        BOOL animated = animator != nil;
        [view setDate:date animated:animated];
        return YES;
    } resetBlock:^(SCWidgetsTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
        NSDate *date = [view _dateFromDate:view.date withCalendarComponent:NSCalendarUnitMinute setTo:41];
        BOOL animated = animator != nil;
        [view setDate:date animated:animated];
    }];

    [attributesBinder bindAttribute:@"intervalMinutes" invalidateLayoutOnChange:NO withIntBlock:^BOOL(SCWidgetsTimePicker *view, NSInteger attributeValue, id<SCValdiAnimatorProtocol> animator) {
        [view setMinuteInterval:attributeValue];
        return YES;
    } resetBlock:^(SCWidgetsTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
        [view setMinuteInterval:1];
    }];

    [attributesBinder bindAttribute:@"onChange"
                  withFunctionBlock:^(SCWidgetsTimePicker *view, id<SCValdiFunction> attributeValue) {
        view->_onChange = attributeValue;
    }
                         resetBlock:^(SCWidgetsTimePicker *view) {
        view->_onChange = nil;
    }];

    [attributesBinder bindAttribute:@"color"
        invalidateLayoutOnChange:NO
        withColorBlock:^BOOL(SCWidgetsTimePicker *view, UIColor *attributeValue, id<SCValdiAnimatorProtocol> animator) {
            [view setValue:attributeValue forKey:@"textColor"];
            [view setValue:@(NO) forKey:@"highlightsToday"];
            return YES;
        }
        resetBlock:^(SCWidgetsTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
            [view setValue:nil forKey:@"textColor"];
    }];

    [attributesBinder bindAttribute:@"preferredStyle"
           invalidateLayoutOnChange:YES
                       withIntBlock:^BOOL(SCWidgetsTimePicker *view, NSInteger attributeValue, id<SCValdiAnimatorProtocol> animator) {
        SCWidgetsSetDatePickerStyle(view, attributeValue);
        return YES;
    } resetBlock:^(SCWidgetsTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
        SCWidgetsSetDatePickerStyle(view, 1 /* wheels */);
    }];

    [attributesBinder setPlaceholderViewMeasureDelegate:^UIView *{
        return [SCWidgetsTimePicker new];
    }];
}

@end
