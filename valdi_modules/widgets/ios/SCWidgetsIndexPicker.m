//
//  SCWidgetsIndexPicker.m
//  Valdi_Widgets
//

#import "SCWidgetsIndexPicker.h"

#import "valdi_core/SCValdiAttributesBinderBase.h"
#import "valdi_core/SCValdiFunction.h"
#import "valdi_core/SCValdiMarshaller.h"
#import "valdi_core/SCNValdiCoreCompositeAttributePart.h"

@implementation SCWidgetsIndexPicker {
    NSArray<NSString *>* _labels;
    id<SCValdiFunction> _Nullable _onChange;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        self.delegate = self;
        self.dataSource = self;
    }
    return self;
}

#pragma mark - Data source

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView
{
    return 1;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component
{
    return [_labels count];
}

- (NSString *)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component
{
    if (row < 0) {
        return @"--";
    }
    if ([_labels count] <= (NSUInteger)row) {
        return @"--";
    }
    return [_labels objectAtIndex:row];
}

#pragma mark - Data events

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component
{
    if (!_onChange) {
        return;
    }
    SCValdiMarshallerScoped(marshaller, {
        SCValdiMarshallerPushDouble(marshaller, row);
        [_onChange performWithMarshaller:marshaller];
    });
}

#pragma mark - Internal methods

- (BOOL)_setContent:(NSNumber *)index labels:(NSArray *)labels animator:(id<SCValdiAnimatorProtocol>)animator
{
    if (![_labels isEqual:labels]) {
        for (id label in labels) {
            if (![label isKindOfClass:[NSString class]]) {
                return NO;
            }
        }
        _labels = labels;
        [self reloadAllComponents];
    }

    NSInteger size = [labels count];

    NSInteger newIndex = MAX(0, MIN(size - 1, [index integerValue]));
    if (newIndex != [self selectedRowInComponent:0]) {
        [self selectRow:newIndex inComponent:0 animated:animator != nil];
    }

    return YES;
}

#pragma mark - Static methods

+ (NSArray<SCNValdiCoreCompositeAttributePart *> *)_contentComponents
{
    return @[
             [[SCNValdiCoreCompositeAttributePart alloc] initWithAttribute:@"index"
                                                                     type:SCNValdiCoreAttributeTypeDouble
                                                                 optional:YES
                                                 invalidateLayoutOnChange:NO],
             [[SCNValdiCoreCompositeAttributePart alloc] initWithAttribute:@"labels"
                                                                     type:SCNValdiCoreAttributeTypeUntyped
                                                                 optional:NO
                                                 invalidateLayoutOnChange:NO],
             ];
}

+ (void)bindAttributes:(id<SCValdiAttributesBinderProtocol>)attributesBinder {

    [attributesBinder bindCompositeAttribute:@"content"
                parts:[SCWidgetsIndexPicker _contentComponents]
                            withUntypedBlock:^BOOL(SCWidgetsIndexPicker *view, id attributeValue, id<SCValdiAnimatorProtocol> animator) {
            NSArray *attributeValueArray = [attributeValue isKindOfClass:[NSArray class]] ? attributeValue : nil;
            if (attributeValueArray.count != 2) {
                return NO;
            }

            NSNumber *index = [attributeValueArray[0] isKindOfClass:[NSNumber class]] ? attributeValueArray[0] : nil;
            NSArray *labels = [attributeValueArray[1] isKindOfClass:[NSArray class]] ? attributeValueArray[1] : nil;

            return [view _setContent:index labels:labels animator:animator];
        }
                resetBlock:^(SCWidgetsIndexPicker *view, id<SCValdiAnimatorProtocol> animator) {
                    [view _setContent:nil labels:nil animator:animator];
                }];

    [attributesBinder bindAttribute:@"onChange"
                  withFunctionBlock:^(SCWidgetsIndexPicker *view, id<SCValdiFunction> attributeValue) {
        view->_onChange = attributeValue;
    }
                         resetBlock:^(SCWidgetsIndexPicker *view) {
        view->_onChange = nil;
    }];

    [attributesBinder setPlaceholderViewMeasureDelegate:^UIView *{
        return [SCWidgetsIndexPicker new];
    }];

}

@end
