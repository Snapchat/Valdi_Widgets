//
//  SCWidgetsMacOSLabel.h
//  valdi-widgets-macos
//

#import "valdi/macos/SCValdiMacOSAttributesBinder.h"
#import <Cocoa/Cocoa.h>

NS_ASSUME_NONNULL_BEGIN

/// Non-editable NSTextField label that supports emoji rendering via AppKit.
@interface SCWidgetsMacOSLabel : NSTextField

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder;

@end

NS_ASSUME_NONNULL_END
