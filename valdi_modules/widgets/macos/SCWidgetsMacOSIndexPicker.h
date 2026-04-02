//
//  SCWidgetsMacOSIndexPicker.h
//  valdi-widgets-macos
//

#import "valdi/macos/SCValdiMacOSAttributesBinder.h"
#import <Cocoa/Cocoa.h>

NS_ASSUME_NONNULL_BEGIN

@interface SCWidgetsMacOSIndexPicker : NSPopUpButton

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder;

@end

NS_ASSUME_NONNULL_END
