# Share module – Android

Native Android implementation for the polyglot Share module. `ShareHelper.share(context, title, text, url)` opens the system share sheet via `Intent.ACTION_SEND` and `Intent.createChooser`.

The host app must wire `Device.share` (or equivalent bridge) to call `ShareHelper.share()` when `Share.share(options)` is invoked from TS. This module does not add Share to Valdi’s Device object; wiring is done in the app or Valdi runtime.
