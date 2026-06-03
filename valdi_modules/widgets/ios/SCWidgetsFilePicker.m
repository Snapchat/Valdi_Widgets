#import "SCWidgetsFilePicker.h"

#import "valdi_core/SCValdiAttributesBinderBase.h"
#import "valdi_core/SCValdiFunction.h"
#import "valdi_core/SCValdiMarshaller.h"

#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

@interface SCWidgetsFilePicker () <UIDocumentPickerDelegate>
@property (nonatomic) UIButton *pickButton;
@property (nonatomic) id<SCValdiFunction> onSelect;
@property (nonatomic) BOOL allowMultiple;
@property (nonatomic, copy, nullable) NSString *accept;
@end

@implementation SCWidgetsFilePicker

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        _pickButton = [UIButton buttonWithType:UIButtonTypeSystem];
        [_pickButton setTitle:@"Choose file…" forState:UIControlStateNormal];
        [_pickButton addTarget:self action:@selector(_openPicker) forControlEvents:UIControlEventTouchUpInside];
        _pickButton.translatesAutoresizingMaskIntoConstraints = NO;
        [self addSubview:_pickButton];

        [NSLayoutConstraint activateConstraints:@[
            [_pickButton.centerXAnchor constraintEqualToAnchor:self.centerXAnchor],
            [_pickButton.centerYAnchor constraintEqualToAnchor:self.centerYAnchor],
        ]];
    }
    return self;
}

- (CGSize)sizeThatFits:(CGSize)size {
    return CGSizeMake(size.width, MAX(56, size.height));
}

#pragma mark - File picker

- (void)_openPicker {
    NSArray<UTType *> *types = [self _resolveContentTypes];
    UIDocumentPickerViewController *picker =
        [[UIDocumentPickerViewController alloc] initForOpeningContentTypes:types];
    picker.allowsMultipleSelection = self.allowMultiple;
    picker.delegate = self;

    UIViewController *vc = [self _findViewController];
    if (vc) {
        [vc presentViewController:picker animated:YES completion:nil];
    }
}

- (NSArray<UTType *> *)_resolveContentTypes {
    if (self.accept.length == 0) {
        return @[UTTypeItem];
    }
    NSMutableArray<UTType *> *types = [NSMutableArray array];
    for (NSString *raw in [self.accept componentsSeparatedByString:@","]) {
        NSString *trimmed = [raw stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceCharacterSet];
        UTType *type = [UTType typeWithMIMEType:trimmed];
        if (type) {
            [types addObject:type];
        }
    }
    return types.count > 0 ? types : @[UTTypeItem];
}

- (UIViewController *)_findViewController {
    UIResponder *responder = self;
    while (responder) {
        if ([responder isKindOfClass:[UIViewController class]]) {
            return (UIViewController *)responder;
        }
        responder = responder.nextResponder;
    }
    return nil;
}

#pragma mark - UIDocumentPickerDelegate

- (void)documentPicker:(UIDocumentPickerViewController *)controller
    didPickDocumentsAtURLs:(NSArray<NSURL *> *)urls {
    if (!self.onSelect) return;
    for (NSURL *url in urls) {
        SCValdiMarshallerScoped(marshaller, {
            NSInteger objectIndex = SCValdiMarshallerPushMap(marshaller, 1);
            SCValdiMarshallerPushString(marshaller, url.lastPathComponent);
            SCValdiMarshallerPutMapPropertyUninterned(marshaller, @"fileName", objectIndex);
            [self.onSelect performWithMarshaller:marshaller];
        });
    }
}

#pragma mark - Attribute binding

+ (void)bindAttributes:(id<SCValdiAttributesBinderProtocol>)attributesBinder {
    [attributesBinder bindAttribute:@"onSelect"
                  withFunctionBlock:^(SCWidgetsFilePicker *view, id<SCValdiFunction> fn) {
        view.onSelect = fn;
    }
                         resetBlock:^(SCWidgetsFilePicker *view) {
        view.onSelect = nil;
    }];

    [attributesBinder bindAttribute:@"allowMultiple"
           invalidateLayoutOnChange:NO
                      withBoolBlock:^BOOL(SCWidgetsFilePicker *view, BOOL value, id<SCValdiAnimatorProtocol> animator) {
        view.allowMultiple = value;
        return YES;
    } resetBlock:^(SCWidgetsFilePicker *view, id<SCValdiAnimatorProtocol> animator) {
        view.allowMultiple = NO;
    }];

    [attributesBinder bindAttribute:@"accept"
           invalidateLayoutOnChange:NO
                    withStringBlock:^BOOL(SCWidgetsFilePicker *view, NSString *value, id<SCValdiAnimatorProtocol> animator) {
        view.accept = value;
        return YES;
    } resetBlock:^(SCWidgetsFilePicker *view, id<SCValdiAnimatorProtocol> animator) {
        view.accept = nil;
    }];
}

@end
