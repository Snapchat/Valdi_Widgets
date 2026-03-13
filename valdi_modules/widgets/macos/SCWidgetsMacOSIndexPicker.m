//
//  SCWidgetsMacOSIndexPicker.m
//  valdi-widgets-macos
//

#import "SCWidgetsMacOSIndexPicker.h"
#import "valdi/macos/SCValdiMacOSFunction.h"

@implementation SCWidgetsMacOSIndexPicker {
    NSPopUpButton *_popUp;
    NSArray<NSString *> *_labels;
    NSInteger _selectedIndex;
    SCValdiMacOSFunction *_onChange;
}

- (instancetype)initWithFrame:(NSRect)frameRect {
    self = [super initWithFrame:frameRect];
    if (self) {
        _labels = @[];
        _selectedIndex = 0;
        _popUp = [[NSPopUpButton alloc] initWithFrame:self.bounds pullsDown:NO];
        _popUp.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
        [_popUp setTarget:self];
        [_popUp setAction:@selector(_handleOnChange)];
        [self addSubview:_popUp];
    }
    return self;
}

- (void)_handleOnChange {
    if (!_onChange) return;
    NSInteger index = _popUp.indexOfSelectedItem;
    [_onChange performWithParameters:@[@(index)]];
}

// The 'content' attribute is a composite: @[index, labels]
- (void)valdi_setContent:(id)value {
    if (![value isKindOfClass:[NSArray class]]) return;
    NSArray *arr = (NSArray *)value;
    if (arr.count != 2) return;

    NSArray *newLabels = arr[1];
    if ([newLabels isKindOfClass:[NSArray class]] && ![newLabels isEqual:_labels]) {
        _labels = newLabels;
        [_popUp removeAllItems];
        for (id label in _labels) {
            if ([label isKindOfClass:[NSString class]]) {
                [_popUp addItemWithTitle:label];
            }
        }
    }

    NSNumber *indexNum = arr[0];
    if ([indexNum isKindOfClass:[NSNumber class]]) {
        NSInteger newIndex = indexNum.integerValue;
        newIndex = MAX(0, MIN(newIndex, (NSInteger)_labels.count - 1));
        if (newIndex != _popUp.indexOfSelectedItem && _labels.count > 0) {
            [_popUp selectItemAtIndex:newIndex];
        }
    }
}

- (void)valdi_setOnChange:(id)value {
    _onChange = value;
}

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder {
    [attributesBinder bindUntypedAttribute:@"content"
                  invalidateLayoutOnChange:YES
                                  selector:@selector(valdi_setContent:)];
    [attributesBinder bindUntypedAttribute:@"onChange"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setOnChange:)];
}

@end
