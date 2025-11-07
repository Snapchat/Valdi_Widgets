import { Device } from 'valdi_core/src/Device';

// Values defined here should mirror `widgets/src/styles/spacing.scss`

export enum Spacing {
  XXS = 2,
  XS = 4,
  SM = 8,
  MD = 16,
  LG = 32,
  XL = 64,
}

export enum SemanticSpacing {
  HAIRLINE_WIDTH = Device.isAndroid() || Device.isIOS() ? 1 / Device.getDisplayScale() : 1,
}
