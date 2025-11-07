import { Component } from 'valdi_core/src/Component';
import { SemanticColor } from 'widgets/src/styles/semanticColorsGen';

/** Event sent when the user changes the date in the picker */
export interface DatePickerOnChangeEvent {
  date: Date;
}

/** View model type for DatePicker */
export interface DatePickerViewModel {
  /** Underlying date that the picker should be configured with */
  date?: Date;
  /** Function to call when the user changes the date using the picker */
  onChange?: (event: DatePickerOnChangeEvent) => void;
  /** Date representing the latest moment available to select using the picker */
  maximumDate?: Date;
  /** Date representing the earliest moment available to select using the picker */
  minimumDate?: Date;
  // @deprecated - temporary iOS only color override before dark mode rolls out across all devices
  color?: SemanticColor;
}

/**
 * Convenience wrapper around PlatformDatePicker. Renders as a UIDatePicker/DatePicker/TimePicker under the hood.
 */
export class DatePicker extends Component<DatePickerViewModel, {}> {
  platformViewModel!: PlatformDatePickerViewModel;

  onViewModelUpdate(): void {
    this.platformViewModel = this.getPlatformViewModel();
  }

  onRender(): void {
    <custom-view
      iosClass='SCValdiDatePicker'
      androidClass='com.snap.valdi.views.ValdiDatePicker'
      canAlwaysScrollVertical={true}
      {...this.platformViewModel}
    />;
  }

  private getPlatformViewModel(): PlatformDatePickerViewModel {
    const { onChange, date, minimumDate, maximumDate, color } = this.viewModel;
    const minimumDateSeconds = minimumDate && minimumDate.getTime() / 1000;
    const maximumDateSeconds = maximumDate && maximumDate.getTime() / 1000;

    let innerOnChange;
    if (onChange) {
      innerOnChange = (event: PlatformDatePickerOnChangeEvent) => {
        const mappedEvent: DatePickerOnChangeEvent = {
          date: new Date(event.dateSeconds * 1000),
        };
        onChange(mappedEvent);
      };
    }

    return {
      minimumDateSeconds,
      maximumDateSeconds,
      dateSeconds: date && date.getTime() / 1000,
      onChange: innerOnChange,
      color,
    };
  }
}

//#region Platform-binding-specific types:
interface PlatformDatePickerOnChangeEvent {
  dateSeconds: number;
}

interface PlatformDatePickerViewModel {
  dateSeconds?: number;
  minimumDateSeconds?: number;
  maximumDateSeconds?: number;
  onChange?: (event: PlatformDatePickerOnChangeEvent) => void;
  color?: SemanticColor;
}
//#endregion
