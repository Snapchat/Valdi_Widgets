package com.snap.widgets.text

import android.content.Context
import android.view.ViewGroup
import com.snap.valdi.attributes.AttributesBinder
import com.snap.valdi.attributes.AttributesBindingContext
import com.snap.valdi.attributes.RegisterAttributesBinder
import com.snap.valdi.views.ValdiEmojiTextView

@RegisterAttributesBinder
class ValdiEmojiTextViewAttributesBinder(private val context: Context) : AttributesBinder<ValdiEmojiTextView> {

    override val viewClass: Class<ValdiEmojiTextView>
        get() = ValdiEmojiTextView::class.java

    override fun bindAttributes(attributesBindingContext: AttributesBindingContext<ValdiEmojiTextView>) {
        attributesBindingContext.setPlaceholderViewMeasureDelegate(lazy {
            ValdiEmojiTextView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
            }
        })
    }
}
