#import "ShareHelper.h"
#import <UIKit/UIKit.h>

@implementation SCValdiShareHelper

+ (void)shareWithTitle:(NSString *)title
                  text:(NSString *)text
                   url:(NSString *)url {
  NSMutableArray *items = [NSMutableArray array];
  if (text.length > 0) {
    [items addObject:text];
  }
  if (url.length > 0) {
    NSURL *parsed = [NSURL URLWithString:url];
    if (parsed) {
      [items addObject:parsed];
    }
  }
  if (items.count == 0) {
    return;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    UIWindowScene *windowScene = nil;
    for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
      if ([scene isKindOfClass:[UIWindowScene class]]) {
        UIWindowScene *ws = (UIWindowScene *)scene;
        if (ws.activationState == UISceneActivationStateForegroundActive) {
          windowScene = ws;
          break;
        }
      }
    }
    if (!windowScene) {
      return;
    }
    UIWindow *keyWindow = nil;
    for (UIWindow *w in windowScene.windows) {
      if (w.isKeyWindow) {
        keyWindow = w;
        break;
      }
    }
    UIViewController *root = keyWindow.rootViewController;
    if (!root) {
      return;
    }
    while (root.presentedViewController) {
      root = root.presentedViewController;
    }
    UIActivityViewController *activity = [[UIActivityViewController alloc] initWithActivityItems:items applicationActivities:nil];
    if (activity.popoverPresentationController) {
      activity.popoverPresentationController.sourceView = root.view;
      activity.popoverPresentationController.sourceRect = CGRectMake(CGRectGetMidX(root.view.bounds), CGRectGetMidY(root.view.bounds), 0, 0);
      activity.popoverPresentationController.permittedArrowDirections = 0;
    }
    [root presentViewController:activity animated:YES completion:nil];
  });
}

@end
