package com.snap.widgets.pickers

import android.content.Context
import com.snap.valdi.attributes.AttributesBinder
import com.snap.valdi.attributes.AttributesBindingContext
import com.snap.valdi.attributes.RegisterAttributesBinder

@RegisterAttributesBinder
class ValdiFilePickerAttributesBinder(private val context: Context) : AttributesBinder<ValdiFilePicker> {

    override val viewClass: Class<ValdiFilePicker>
        get() = ValdiFilePicker::class.java

    override fun bindAttributes(attributesBindingContext: AttributesBindingContext<ValdiFilePicker>) {
        attributesBindingContext.bindFunctionAttribute("onSelect", { view, fn ->
            view.onSelectFunction = fn
        }, { view ->
            view.onSelectFunction = null
        })

        attributesBindingContext.bindBooleanAttribute("allowMultiple", false, { view, value, _ ->
            view.allowMultiple = value
        }, { view, _ ->
            view.allowMultiple = false
        })

        attributesBindingContext.bindStringAttribute("accept", false, { view, value, _ ->
            view.accept = value
        }, { view, _ ->
            view.accept = null
        })
    }
}
