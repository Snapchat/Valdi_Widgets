/**
 * Native bridge for Share (Valdi native-polyglot.md). Implemented by ShareHelper on Android and iOS.
 * @ExportModule
 */

/**
 * @ExportModel({
 *   ios: 'SCValdiShareOptions',
 *   android: 'com.snap.valdi.modules.share.ShareOptions'
 * })
 */
export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Opens the system share sheet with the given options. Implemented natively.
 * @ExportFunction
 */
export function share(options: ShareOptions): void;
