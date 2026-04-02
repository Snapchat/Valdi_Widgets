package com.snap.widgets.pickers

import android.content.Context
import android.view.ViewGroup
import com.snap.valdi.attributes.AttributesBinder
import com.snap.valdi.attributes.AttributesBindingContext
import com.snap.valdi.attributes.RegisterAttributesBinder
import com.snap.valdi.attributes.impl.animations.ValdiAnimator
import com.snap.valdi.callable.ValdiFunction
import com.snap.valdi.views.ValdiTimePicker

@RegisterAttributesBinder
class ValdiTimePickerAttributesBinder(private val context: Context) : AttributesBinder<ValdiTimePicker> {

    override val viewClass: Class<ValdiTimePicker>
        get() = ValdiTimePicker::class.java

    fun applyHourOfDay(view: ValdiTimePicker, value: Int, animator: ValdiAnimator?) {
        view.hourOfDay = value
    }

    fun resetHourOfDay(view: ValdiTimePicker, animator: ValdiAnimator?) {
        view.hourOfDay = null
    }

    fun applyMinuteOfHour(view: ValdiTimePicker, value: Int, animator: ValdiAnimator?) {
        view.minuteOfHour = value
    }

    fun resetMinuteOfHour(view: ValdiTimePicker, animator: ValdiAnimator?) {
        view.minuteOfHour = null
    }

    fun applyInterval(view: ValdiTimePicker, value: Int, animator: ValdiAnimator?) {
        view.intervalMinutes = value
    }

    fun resetInterval(view: ValdiTimePicker, animator: ValdiAnimator?) {
        view.intervalMinutes = 1
    }

    private fun applyOnChange(view: ValdiTimePicker, fn: ValdiFunction) {
        view.onChangeFunction = fn
    }

    private fun resetOnChange(view: ValdiTimePicker) {
        view.onChangeFunction = null
    }

    private fun applyPreferredStyle(view: ValdiTimePicker, value: Int, animator: ValdiAnimator?) {
        view.preferredStyle = value
    }

    private fun resetPreferredStyle(view: ValdiTimePicker, animator: ValdiAnimator?) {
        view.preferredStyle = 1 // spinner
    }

    private fun noopApplyColor(view: ValdiTimePicker, value: Int, animator: ValdiAnimator?) {
        // noop
        // DO NOT USE - @mli6 - temporary workaround pending release of iOS dark mode
    }

    private fun noopResetColor(view: ValdiTimePicker, animator: ValdiAnimator?) {
        // noop
        // DO NOT USE - @mli6 - temporary workaround pending release of iOS dark mode
    }

    override fun bindAttributes(attributesBindingContext: AttributesBindingContext<ValdiTimePicker>) {
        attributesBindingContext.bindIntAttribute("hourOfDay", false, this::applyHourOfDay, this::resetHourOfDay)
        attributesBindingContext.bindIntAttribute("minuteOfHour", false, this::applyMinuteOfHour, this::resetMinuteOfHour)
        attributesBindingContext.bindIntAttribute("intervalMinutes", false, this::applyInterval, this::resetInterval)
        attributesBindingContext.bindFunctionAttribute("onChange", this::applyOnChange, this::resetOnChange)
        attributesBindingContext.bindIntAttribute("preferredStyle", true, this::applyPreferredStyle, this::resetPreferredStyle)
        attributesBindingContext.bindColorAttribute("color", false, this::noopApplyColor, this::noopResetColor)

        attributesBindingContext.setPlaceholderViewMeasureDelegate(lazy {
            ValdiTimePicker(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                )
            }
        })
    }
}
