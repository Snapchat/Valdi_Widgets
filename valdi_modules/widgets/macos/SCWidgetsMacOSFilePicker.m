#import "SCWidgetsMacOSFilePicker.h"
#import "valdi/macos/SCValdiMacOSFunction.h"

#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>

@implementation SCWidgetsMacOSFilePicker {
    NSButton *_pickButton;
    SCValdiMacOSFunction *_onSelect;
    BOOL _allowMultiple;
    NSString *_accept;
}

- (instancetype)initWithFrame:(NSRect)frameRect {
    self = [super initWithFrame:frameRect];
    if (self) {
        _pickButton = [NSButton buttonWithTitle:@"Choose file…" target:self action:@selector(_openPanel:)];
        _pickButton.bezelStyle = NSBezelStyleRounded;
        _pickButton.translatesAutoresizingMaskIntoConstraints = NO;
        [self addSubview:_pickButton];

        [NSLayoutConstraint activateConstraints:@[
            [_pickButton.centerXAnchor constraintEqualToAnchor:self.centerXAnchor],
            [_pickButton.centerYAnchor constraintEqualToAnchor:self.centerYAnchor],
        ]];
    }
    return self;
}

- (void)_openPanel:(id)sender {
    (void)sender;
    NSOpenPanel *panel = [NSOpenPanel openPanel];
    panel.allowsMultipleSelection = _allowMultiple;
    panel.canChooseDirectories = NO;
    panel.canChooseFiles = YES;
    panel.canCreateDirectories = NO;
    panel.title = @"Choose a file";

    if (_accept.length > 0) {
        NSMutableArray<UTType *> *types = [NSMutableArray array];
        for (NSString *raw in [_accept componentsSeparatedByString:@","]) {
            NSString *trimmed = [raw stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceCharacterSet];
            UTType *type = [UTType typeWithMIMEType:trimmed];
            if (type) [types addObject:type];
        }
        if (types.count > 0) {
            panel.allowedContentTypes = types;
        }
    }

    NSInteger result = [panel runModal];
    if (result != NSModalResponseOK || !_onSelect) return;

    for (NSURL *url in panel.URLs) {
        [_onSelect performWithParameters:@[@{
            @"fileName": url.lastPathComponent ?: @"",
            @"path": url.path ?: @"",
        }]];
    }
}

- (void)valdi_setOnSelect:(id)value {
    _onSelect = value;
}

- (void)valdi_setAllowMultiple:(id)value {
    _allowMultiple = [value boolValue];
}

- (void)valdi_setAccept:(id)value {
    _accept = [value isKindOfClass:[NSString class]] ? value : nil;
}

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder {
    [attributesBinder bindUntypedAttribute:@"onSelect"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setOnSelect:)];
    [attributesBinder bindUntypedAttribute:@"allowMultiple"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setAllowMultiple:)];
    [attributesBinder bindUntypedAttribute:@"accept"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setAccept:)];
}

@end
