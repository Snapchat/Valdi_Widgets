//
//  SCWidgetsIndexPicker.m
//  Valdi
//
//  Created by Vincent Brunet on 03/16/21.
//

#import "valdi/ios/Views/SCWidgetsIndexPicker.h"

#import "valdi/ios/Categories/UIView+Valdi.h"

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

- (CGPoint)convertPoint:(CGPoint)point fromView:(UIView *)view
{
    return [self valdi_convertPoint:point fromView:view];
}

- (CGPoint)convertPoint:(CGPoint)point toView:(UIView *)view
{
    return [self valdi_convertPoint:point toView:view];
}

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event
{
    if (self.valdiHitTest != nil) {
        return [self valdi_hitTest:point withEvent:event withCustomHitTest:self.valdiHitTest];
    }
    return [super hitTest:point withEvent:event];
}

#pragma mark - UIView+Valdi

- (BOOL)willEnqueueIntoValdiPool
{
    return YES;
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
    [self valdi_notifySelectRow:row];
}

#pragma mark - Internal methods

INTERNED_STRING_CONST("index", SCWidgetsIndexPickerIndexKey);

- (void)valdi_notifySelectRow:(NSInteger)row
{
    [self.valdiContext didChangeValue:[NSNumber numberWithInteger:row]
                    forInternedValdiAttribute:SCWidgetsIndexPickerIndexKey()
                              inViewNode:self.valdiViewNode];
    SCValdiMarshallerScoped(marshaller, {
        SCValdiMarshallerPushDouble(marshaller, row);
        [_onChange performWithMarshaller:marshaller];
    });
}

- (BOOL)valdi_setContent:(NSNumber *)index labels:(NSArray *)labels animator:(id<SCValdiAnimatorProtocol>)animator
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

- (void)valdi_setOnChange:(id<SCValdiFunction>)value
{
    _onChange = value;
}

#pragma mark - Static methods

+ (NSArray<SCNValdiCoreCompositeAttributePart *> *)_valdiContentComponents
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
                parts:[SCWidgetsIndexPicker _valdiContentComponents]
                            withUntypedBlock:^BOOL(SCWidgetsIndexPicker *view, id attributeValue, id<SCValdiAnimatorProtocol> animator) {
            NSArray *attributeValueArray = ObjectAs(attributeValue, NSArray);
            if (attributeValueArray.count != 2) {
                return NO;
            }

            NSNumber *index = ObjectAs(attributeValueArray[0], NSNumber);
            NSArray *labels = ObjectAs(attributeValueArray[1], NSArray);

            return [view valdi_setContent:index labels:labels animator:animator];
        }
                resetBlock:^(SCWidgetsIndexPicker *view, id<SCValdiAnimatorProtocol> animator) {
                    [view valdi_setContent:nil labels:nil animator:animator];
                }];

    [attributesBinder bindAttribute:@"onChange"
                  withFunctionBlock:^(SCWidgetsIndexPicker *view, id<SCValdiFunction> attributeValue) {
        [view valdi_setOnChange:attributeValue];
    }
                         resetBlock:^(SCWidgetsIndexPicker *view) {
        [view valdi_setOnChange:nil];
    }];

    [attributesBinder setPlaceholderViewMeasureDelegate:^UIView *{
        return [SCWidgetsIndexPicker new];
    }];

}

@end
