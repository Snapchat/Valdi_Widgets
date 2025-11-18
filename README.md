# Valdi Widgets

Provides helpful UI widgets, styles, and patterns for building apps with [Valdi](https://github.com/Snapchat/Valdi).

## Setup `Valdi_Widgets`

To include this library in your Valdi app, add the following to your project's WORKSPACE:

```
http_archive(
    name = "valdi_widgets",
    strip_prefix = "Valdi_Widgets-beta-0.0.1",
    url = "https://github.com/Snapchat/Valdi_Widgets/archive/refs/tags/beta-0.0.1.tar.gz",
)
```

Add the dependency to your module's BUILD file in `valdi_module` `deps`:

```
"@valdi_widgets//valdi_modules/widgets",
```

Import a component:

```
import { CoreButton } from 'widgets/src/components/button/CoreButton';
```
