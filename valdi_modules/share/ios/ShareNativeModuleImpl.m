// Share polyglot module factory + impl (Valdi native-polyglot.md). VALDI_REGISTER_MODULE + onLoadModule; forwards share() to ShareHelper.
#import <Foundation/Foundation.h>
#import "valdi_core/SCValdiModuleFactoryRegistry.h"
#import <SCCValdiShareTypes/SCCValdiShareTypes.h>
#import "ShareHelper.h"

@interface SCCValdiShareShareNativeModuleImpl : NSObject <SCCValdiShareShareNativeModule>
@end

@implementation SCCValdiShareShareNativeModuleImpl

- (void)shareWithOptions:(SCValdiShareOptions *)options {
  [SCValdiShareHelper shareWithTitle:options.title text:options.text url:options.url];
}

@end

@interface SCCValdiShareShareNativeModuleFactoryImpl : SCCValdiShareShareNativeModuleFactory
@end

@implementation SCCValdiShareShareNativeModuleFactoryImpl

VALDI_REGISTER_MODULE()

- (id<SCCValdiShareShareNativeModule>)onLoadModule {
  return [SCCValdiShareShareNativeModuleImpl new];
}

@end
