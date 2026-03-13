package com.snap.valdi.share

import android.content.Context
import android.content.Intent

/**
 * Native Android implementation for the polyglot Share module.
 * Opens the system share sheet (Intent.ACTION_SEND).
 * The host app should wire (Device as any).share(options) to ShareHelper.share().
 */
object ShareHelper {

    /**
     * Show the system share sheet with the given content.
     * Call from the native bridge when Share.share(options) is invoked from TS.
     */
    @JvmStatic
    fun share(context: Context, title: String?, text: String?, url: String?) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            val parts = mutableListOf<String>()
            if (!text.isNullOrBlank()) parts.add(text)
            if (!url.isNullOrBlank()) parts.add(url)
            putExtra(Intent.EXTRA_TEXT, parts.joinToString("\n"))
            if (!title.isNullOrBlank()) putExtra(Intent.EXTRA_TITLE, title)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val chooser = Intent.createChooser(intent, title ?: "Share")
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(chooser)
    }
}
