//
//  SCWidgetsMacOSIndexPicker.m
//  valdi-widgets-macos
//

#import "SCWidgetsMacOSIndexPicker.h"
#import "valdi/macos/SCValdiMacOSFunction.h"

@implementation SCWidgetsMacOSIndexPicker {
    NSArray<NSString *> *_labels;
    NSInteger _selectedIndex;
    SCValdiMacOSFunction *_onChange;
}

- (instancetype)initWithFrame:(NSRect)frameRect {
    self = [super initWithFrame:frameRect pullsDown:NO];
    if (self) {
        _labels = @[];
        _selectedIndex = 0;
        [self setTarget:self];
        [self setAction:@selector(_handleOnChange)];
    }
    return self;
}

- (BOOL)acceptsFirstResponder {
    return YES;
}

- (void)mouseDown:(NSEvent *)event {
    // NSPopUpButton's built-in tracking doesn't work when embedded in a Valdi layer-backed hierarchy.
    // Convert to screen coordinates and show the menu with inView:nil to bypass coordinate issues.
    NSPoint windowPoint = [self convertPoint:NSZeroPoint toView:nil];
    NSPoint screenPoint = [self.window convertPointToScreen:windowPoint];
    [self.menu popUpMenuPositioningItem:self.selectedItem
                             atLocation:screenPoint
                                 inView:nil];
}

- (void)_handleOnChange {
    if (!_onChange) return;
    NSInteger index = self.indexOfSelectedItem;
    [_onChange performWithParameters:@[@(index)]];
}

- (void)valdi_setLabels:(id)value {
    if (![value isKindOfClass:[NSArray class]]) return;
    NSArray *newLabels = (NSArray *)value;
    if ([newLabels isEqual:_labels]) return;
    _labels = newLabels;
    [self removeAllItems];
    for (id label in _labels) {
        if ([label isKindOfClass:[NSString class]]) {
            [self addItemWithTitle:label];
        }
    }
    NSInteger clamped = MAX(0, MIN(_selectedIndex, (NSInteger)_labels.count - 1));
    if (_labels.count > 0) {
        [self selectItemAtIndex:clamped];
    }
}

- (void)valdi_setIndex:(id)value {
    if (![value isKindOfClass:[NSNumber class]]) return;
    NSInteger newIndex = [(NSNumber *)value integerValue];
    newIndex = MAX(0, MIN(newIndex, (NSInteger)_labels.count - 1));
    _selectedIndex = newIndex;
    if (_labels.count > 0 && newIndex != self.indexOfSelectedItem) {
        [self selectItemAtIndex:newIndex];
    }
}

- (void)valdi_setOnChange:(id)value {
    _onChange = value;
}

+ (void)bindAttributes:(SCValdiMacOSAttributesBinder *)attributesBinder {
    [attributesBinder bindUntypedAttribute:@"labels"
                  invalidateLayoutOnChange:YES
                                  selector:@selector(valdi_setLabels:)];
    [attributesBinder bindUntypedAttribute:@"index"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setIndex:)];
    [attributesBinder bindUntypedAttribute:@"onChange"
                  invalidateLayoutOnChange:NO
                                  selector:@selector(valdi_setOnChange:)];
}

@end
