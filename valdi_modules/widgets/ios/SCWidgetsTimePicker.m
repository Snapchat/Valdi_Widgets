//
//  SCWidgetsTimePicker.m
//  Valdi
//
//  Created by Brandon Francis on 3/9/19.
//

#import "valdi/ios/Views/SCWidgetsTimePicker.h"
#import "valdi/ios/Views/SCWidgetsDatePickerUtils.h"

#import "valdi/ios/Categories/UIView+Valdi.h"

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

- (CGPoint)convertPoint:(CGPoint)point fromView:(UIView *)view
{
    return [self valdi_convertPoint:point fromView:view];
}

- (CGPoint)convertPoint:(CGPoint)point toView:(UIView *)view
{
    return [self valdi_convertPoint:point toView:view];
}


#pragma mark - UIView+Valdi

- (BOOL)willEnqueueIntoValdiPool {
    return YES;
}

#pragma mark - Action handling methods

INTERNED_STRING_CONST("hourOfDay", SCWidgetsTimePickerHourOfDayKey);
INTERNED_STRING_CONST("minuteOfHour", SCWidgetsTimePickerMinuteOfHourKey);

#pragma mark - Internal methods

// DO NOT USE - @mli6 - temporary workaround pending release of iOS dark mode
- (BOOL)valdi_setTextColor:(UIColor *)color
{
    [self setValue:color forKey:@"textColor"];
    [self setValue:@(NO) forKey:@"highlightsToday"];

    return YES;
}

- (void)valdi_setOnChange:(id<SCValdiFunction>)onChange
{
    _onChange = onChange;
}

- (void)_handleOnChange
{
    NSDateComponents *components = [self.calendar components:(NSCalendarUnitHour | NSCalendarUnitMinute)
                                                    fromDate:self.date];
    NSInteger hourOfDay = components.hour;
    NSInteger minuteOfHour = components.minute;
    
    [self.valdiContext didChangeValue:@(hourOfDay)
            forInternedValdiAttribute:SCWidgetsTimePickerHourOfDayKey()
                              inViewNode:self.valdiViewNode];
    [self.valdiContext didChangeValue:@(minuteOfHour)
            forInternedValdiAttribute:SCWidgetsTimePickerMinuteOfHourKey()
                              inViewNode:self.valdiViewNode];
    
    if (!_onChange) {
        return;
    }
    
    // pseudocode: _onChange.call({ "hourOfDay": hourOfDay, "minuteOfHour": minuteOfHour })
    SCValdiMarshallerScoped(marshaller, {
        NSInteger objectIndex = SCValdiMarshallerPushMap(marshaller, 2);
        SCValdiMarshallerPushInt(marshaller, (int32_t)hourOfDay);
        SCValdiMarshallerPutMapProperty(marshaller, SCWidgetsTimePickerHourOfDayKey(), objectIndex);
        SCValdiMarshallerPushInt(marshaller,  (int32_t)minuteOfHour);
        SCValdiMarshallerPutMapProperty(marshaller, SCWidgetsTimePickerMinuteOfHourKey(), objectIndex);
        
        [_onChange performWithMarshaller:marshaller];
    });
}

- (NSDate *)_dateFromDate:(NSDate *)baseDate withCalendarComponent:(NSCalendarUnit)component setTo:(NSInteger)value
{
    NSCalendar *calendar = self.calendar;
    NSDateComponents *hourMinuteComponents = [self.calendar components:NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond fromDate:baseDate];
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
        [view valdi_setOnChange:attributeValue];
    }
                         resetBlock:^(SCWidgetsTimePicker *view) {
        [view valdi_setOnChange:nil];
    }];

    [attributesBinder bindAttribute:@"color"
        invalidateLayoutOnChange:NO
        withColorBlock:^BOOL(SCWidgetsTimePicker *view, UIColor *attributeValue, id<SCValdiAnimatorProtocol> animator) {
            return [view valdi_setTextColor:attributeValue];
        }
        resetBlock:^(SCWidgetsTimePicker *view, id<SCValdiAnimatorProtocol> animator) {
            [view valdi_setTextColor:nil];
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
