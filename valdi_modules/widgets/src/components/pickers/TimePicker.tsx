import { Component } from 'valdi_core/src/Component';
import { SemanticColor } from 'widgets/src/styles/semanticColorsGen';

export interface TimePickerTime {
  hourOfDay: number;
  minuteOfHour: number;
}

/** Event sent when the user changes the time in the picker */
export interface TimePickerOnChangeEvent {
  pickedTime: TimePickerTime;
}

/** View model type for TimePicker */
export interface TimePickerViewModel {
  time?: TimePickerTime;
  // the time interval to display in minutes, must be dividable from 60 (ex, 10, 15, 30)
  // for localization in non roman numeral locales, the time picker will show the minutes using western numerals
  intervalMinutes?: number;
  /** Function to call when the user changes the date using the picker */
  onChange?: (event: TimePickerOnChangeEvent) => void;
  // @deprecated - temporary iOS only color override before dark mode rolls out across all devices
  color?: SemanticColor;
}

/**
 * Convenience wrapper around PlatformTimePicker. Renders as a UITimePicker/TimePicker under the hood.
 */
export class TimePicker extends Component<TimePickerViewModel, {}> {
  platformViewModel!: PlatformTimePickerViewModel;

  onViewModelUpdate(): void {
    this.platformViewModel = this.getPlatformViewModel();
  }

  onRender(): void {
    <custom-view
      iosClass='SCValdiTimePicker'
      androidClass='com.snap.valdi.views.ValdiTimePicker'
      canAlwaysScrollVertical={true}
      {...this.platformViewModel}
    />;
  }

  private getPlatformViewModel(): PlatformTimePickerViewModel {
    const { onChange, time, intervalMinutes, color } = this.viewModel;

    let innerOnChange;
    if (onChange) {
      innerOnChange = (event: PlatformTimePickerOnChangeEvent) => {
        const pickedTime: TimePickerTime = {
          hourOfDay: event.hourOfDay,
          minuteOfHour: event.minuteOfHour,
        };
        onChange({ pickedTime });
      };
    }

    return {
      hourOfDay: time?.hourOfDay,
      minuteOfHour: time?.minuteOfHour,
      intervalMinutes,
      onChange: innerOnChange,
      color,
    };
  }
}

//#region Platform-binding-specific types:
interface PlatformTimePickerOnChangeEvent {
  hourOfDay: number;
  minuteOfHour: number;
}

interface PlatformTimePickerViewModel {
  hourOfDay?: number;
  minuteOfHour?: number;
  intervalMinutes?: number;
  onChange?: (event: PlatformTimePickerOnChangeEvent) => void;
  color?: SemanticColor;
}
//#endregion
