//
//  SCWidgetsMacOSLabel.m
//  valdi-widgets-macos
//

#import "SCWidgetsMacOSLabel.h"

static NSFont *SCWidgetsMacOSResolveFont(NSString *str) {
    if (![str isKindOfClass:[NSString class]]) return nil;
    NSArray *parts = [str componentsSeparatedByString:@" "];
    if (parts.count < 2) return nil;
    return [NSFont fontWithName:parts[0] size:[parts[1] doubleValue]];
}

static NSColor *SCWidgetsMacOSResolveColor(NSNumber *color) {
    if (![color isKindOfClass:[NSNumber class]]) return nil;
    long value = [color longValue];
    CGFloat r = ((value >> 24) & 0xFF) / 255.0;
    CGFloat g = ((value >> 16) & 0xFF) / 255.0;
    CGFloat b = ((value >> 8) & 0xFF) / 255.0;
    CGFloat a = (value & 0xFF) / 255.0;
    return [NSColor colorWithRed:r green:g blue:b alpha:a];
}

@implementation SCWidgetsMacOSLabel

- (instancetype)initWithFrame:(NSRect)frameRect {
    self = [super initWithFrame:frameRect];
    if (self) {
        self.editable = NO;
        self.bezeled = NO;
        self.drawsBackground = NO;
        self.selectable = NO;
        self.lineBreakMode = NSLineBreakByWordWrapping;
    }
    return self;
}

- (void)valdi_setText:(id)value {
    self.stringValue = [value isKindOfClass:[NSString class]] ? value : @"";
}

- (void)valdi_setColor:(id)value {
    NSColor *color = SCWidgetsMacOSResolveColor(value);
    self.textColor = color ?: [NSColor labelColor];
}

- (void)valdi_setFont:(id)value {
    NSFont *font = SCWidgetsMacOSResolveFont(value);
    self.font = font ?: [NSFont systemFontOfSize:[NSFont systemFontSize]];
}

- (void)valdi_setNumberOfLines:(id)value {
    if ([value isKindOfClass:[NSNumber class]]) {
        self.maximumNumberOfLines = [(NSNumber *)value integerValue];
    }
}

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder {
    [attributesBinder bindUntypedAttribute:@"text"
                  invalidateLayoutOnChange:YES
                                  selector:@selector(valdi_setText:)];
    [attributesBinder bindColorAttribute:@"color"
                invalidateLayoutOnChange:NO
                                selector:@selector(valdi_setColor:)];
    [attributesBinder bindUntypedAttribute:@"font"
                  invalidateLayoutOnChange:YES
                                  selector:@selector(valdi_setFont:)];
    [attributesBinder bindUntypedAttribute:@"numberOfLines"
                  invalidateLayoutOnChange:YES
                                  selector:@selector(valdi_setNumberOfLines:)];
}

@end
