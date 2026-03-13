//
//  SCWidgetsMacOSIndexPicker.h
//  valdi-widgets-macos
//

#import "valdi/macos/SCValdiMacOSAttributesBinder.h"
#import <Cocoa/Cocoa.h>

NS_ASSUME_NONNULL_BEGIN

/// NSView wrapper around NSPopUpButton providing index-based selection.
@interface SCWidgetsMacOSIndexPicker : NSView

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder;

@end

NS_ASSUME_NONNULL_END
