import { share as shareNative, ShareOptions as ShareOptionsNative } from './ShareNative';

export type ShareOptions = ShareOptionsNative;

/**
 * Share content. The correct implementation (native or web) is used based on
 * the platform we build for; no runtime branching.
 */
export const Share = {
  share(options: ShareOptions): Promise<boolean> {
    shareNative(options);
    return Promise.resolve(true);
  },
};
