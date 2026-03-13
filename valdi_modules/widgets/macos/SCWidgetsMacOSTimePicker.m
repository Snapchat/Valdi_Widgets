//
//  SCWidgetsMacOSTimePicker.m
//  valdi-widgets-macos
//

#import "SCWidgetsMacOSTimePicker.h"
#import "valdi/macos/SCValdiMacOSFunction.h"

@implementation SCWidgetsMacOSTimePicker {
    SCValdiMacOSFunction *_onChange;
    // Track pending hour/minute updates so we can apply both atomically.
    NSInteger _pendingHour;
    NSInteger _pendingMinute;
    BOOL _hasPendingHour;
    BOOL _hasPendingMinute;
}

- (instancetype)initWithFrame:(NSRect)frameRect {
    self = [super initWithFrame:frameRect];
    if (self) {
        self.datePickerElements = NSDatePickerElementFlagHourMinute;
        self.datePickerStyle = NSDatePickerStyleTextField;
        self.target = self;
        self.action = @selector(_handleOnChange);
        _pendingHour = 0;
        _pendingMinute = 0;
        _hasPendingHour = NO;
        _hasPendingMinute = NO;
    }
    return self;
}

- (void)_handleOnChange {
    if (!_onChange) return;
    NSCalendar *calendar = [NSCalendar calendarWithIdentifier:NSCalendarIdentifierGregorian];
    NSDateComponents *comps = [calendar components:(NSCalendarUnitHour | NSCalendarUnitMinute)
                                          fromDate:self.dateValue];
    [_onChange performWithParameters:@[@{@"hourOfDay": @(comps.hour), @"minuteOfHour": @(comps.minute)}]];
}

- (void)_applyPendingTimeIfReady {
    if (!_hasPendingHour || !_hasPendingMinute) return;
    _hasPendingHour = NO;
    _hasPendingMinute = NO;
    NSCalendar *calendar = [NSCalendar calendarWithIdentifier:NSCalendarIdentifierGregorian];
    NSDateComponents *comps = [[NSDateComponents alloc] init];
    comps.hour = _pendingHour;
    comps.minute = _pendingMinute;
    // Use a reference date to avoid date pollution in time-only mode
    comps.year = 2000;
    comps.month = 1;
    comps.day = 1;
    NSDate *date = [calendar dateFromComponents:comps];
    if (date) {
        self.dateValue = date;
    }
}

- (void)valdi_setHourOfDay:(id)value {
    if ([value isKindOfClass:[NSNumber class]]) {
        _pendingHour = [(NSNumber *)value integerValue];
        _hasPendingHour = YES;
        [self _applyPendingTimeIfReady];
    }
}

- (void)valdi_setMinuteOfHour:(id)value {
    if ([value isKindOfClass:[NSNumber class]]) {
        _pendingMinute = [(NSNumber *)value integerValue];
        _hasPendingMinute = YES;
        [self _applyPendingTimeIfReady];
    }
}

- (void)valdi_setIntervalMinutes:(id)__unused value {
    // NSDatePicker on macOS does not support custom minute intervals.
}

- (void)valdi_setOnChange:(id)value {
    _onChange = value;
}

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder {
    [attributesBinder bindUntypedAttribute:@"hourOfDay"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setHourOfDay:)];
    [attributesBinder bindUntypedAttribute:@"minuteOfHour"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setMinuteOfHour:)];
    [attributesBinder bindUntypedAttribute:@"intervalMinutes"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setIntervalMinutes:)];
    [attributesBinder bindUntypedAttribute:@"onChange"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setOnChange:)];
}

@end
