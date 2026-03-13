#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Presents the system share sheet (UIActivityViewController).
/// Used by the Share native module implementation.
@interface SCValdiShareHelper : NSObject

+ (void)shareWithTitle:(nullable NSString *)title
                  text:(nullable NSString *)text
                   url:(nullable NSString *)url;

@end

NS_ASSUME_NONNULL_END
