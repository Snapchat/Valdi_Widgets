package com.snap.valdi.modules.share

import com.snap.valdi.context.ValdiContext
import com.snap.valdi.modules.RegisterValdiModule
import com.snap.valdi.share.ShareHelper

/**
 * Share polyglot module factory (Valdi native-polyglot.md).
 * Registers with the runtime and implements the generated ShareNative API via [ShareHelper].
 */
@RegisterValdiModule
class ShareNativeModuleFactoryImpl : ShareNativeModuleFactory() {

    override fun onLoadModule(): ShareNativeModule {
        return object : ShareNativeModule {
            override fun share(options: ShareOptions) {
                val ctx = ValdiContext.current()?.rootView?.context
                if (ctx != null) {
                    ShareHelper.share(ctx, options.title, options.text, options.url)
                }
            }
        }
    }
}
