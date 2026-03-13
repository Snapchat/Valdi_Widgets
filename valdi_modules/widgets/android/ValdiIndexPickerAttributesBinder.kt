package com.snap.widgets.pickers

import android.content.Context
import android.view.ViewGroup
import com.snap.valdi.attributes.AttributesBinder
import com.snap.valdi.attributes.AttributesBindingContext
import com.snap.valdi.attributes.RegisterAttributesBinder
import com.snap.valdi.attributes.impl.animations.ValdiAnimator
import com.snap.valdi.callable.ValdiFunction
import com.snap.valdi.exceptions.AttributeError
import com.snap.valdi.views.ValdiIndexPicker
import com.snapchat.client.valdi_core.AttributeType
import com.snapchat.client.valdi_core.CompositeAttributePart

@RegisterAttributesBinder
class ValdiIndexPickerAttributesBinder(private val context: Context) : AttributesBinder<ValdiIndexPicker> {

    override val viewClass: Class<ValdiIndexPicker>
        get() = ValdiIndexPicker::class.java

    fun applyContent(view: ValdiIndexPicker, value: Any?, animator: ValdiAnimator?) {
        if (value !is Array<*>) {
            throw AttributeError("content should be an array")
        }
        if (value.size != 2) {
            throw AttributeError("content should have 2 values in the given array")
        }
        val index = value[0] as? Double
        val labels = value[1] as? Array<Any>

        view.setContent(index?.toInt(), labels?.map({ it.toString() })?.toTypedArray())
    }

    fun resetContent(view: ValdiIndexPicker, animator: ValdiAnimator?) {
        view.setContent(null, null)
    }

    private fun applyOnChange(view: ValdiIndexPicker, value: ValdiFunction) {
        view.onChange = value
    }

    private fun resetOnChange(view: ValdiIndexPicker) {
        view.onChange = null
    }

    override fun bindAttributes(attributesBindingContext: AttributesBindingContext<ValdiIndexPicker>) {
        attributesBindingContext.bindCompositeAttribute("content", arrayListOf<CompositeAttributePart>(
                CompositeAttributePart("index", AttributeType.DOUBLE, true, false),
                CompositeAttributePart("labels", AttributeType.UNTYPED, false, true)
        ), this::applyContent, this::resetContent)
        attributesBindingContext.bindFunctionAttribute("onChange", this::applyOnChange, this::resetOnChange)

        attributesBindingContext.setPlaceholderViewMeasureDelegate(lazy {
            ValdiIndexPicker(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                )
            }
        })
    }
}
