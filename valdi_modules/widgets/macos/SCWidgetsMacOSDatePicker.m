//
//  SCWidgetsMacOSDatePicker.m
//  valdi-widgets-macos
//

#import "SCWidgetsMacOSDatePicker.h"
#import "valdi/macos/SCValdiMacOSFunction.h"

@implementation SCWidgetsMacOSDatePicker {
    SCValdiMacOSFunction *_onChange;
}

- (instancetype)initWithFrame:(NSRect)frameRect {
    self = [super initWithFrame:frameRect];
    if (self) {
        self.datePickerElements = NSDatePickerElementFlagYearMonthDay;
        self.datePickerStyle = NSDatePickerStyleTextField;
        self.target = self;
        self.action = @selector(_handleOnChange);
    }
    return self;
}

- (void)_handleOnChange {
    if (!_onChange) return;
    NSTimeInterval dateSeconds = self.dateValue.timeIntervalSince1970;
    [_onChange performWithParameters:@[@{@"dateSeconds": @(dateSeconds)}]];
}

- (void)valdi_setDateSeconds:(id)value {
    if ([value isKindOfClass:[NSNumber class]]) {
        self.dateValue = [NSDate dateWithTimeIntervalSince1970:[(NSNumber *)value doubleValue]];
    }
}

- (void)valdi_setMinimumDateSeconds:(id)value {
    if ([value isKindOfClass:[NSNumber class]]) {
        self.minDate = [NSDate dateWithTimeIntervalSince1970:[(NSNumber *)value doubleValue]];
    } else {
        self.minDate = nil;
    }
}

- (void)valdi_setMaximumDateSeconds:(id)value {
    if ([value isKindOfClass:[NSNumber class]]) {
        self.maxDate = [NSDate dateWithTimeIntervalSince1970:[(NSNumber *)value doubleValue]];
    } else {
        self.maxDate = nil;
    }
}

- (void)valdi_setOnChange:(id)value {
    _onChange = value;
}

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder {
    [attributesBinder bindUntypedAttribute:@"dateSeconds"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setDateSeconds:)];
    [attributesBinder bindUntypedAttribute:@"minimumDateSeconds"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setMinimumDateSeconds:)];
    [attributesBinder bindUntypedAttribute:@"maximumDateSeconds"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setMaximumDateSeconds:)];
    [attributesBinder bindUntypedAttribute:@"onChange"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setOnChange:)];
}

@end
