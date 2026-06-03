package com.snap.widgets.pickers

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.graphics.Color
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import com.snap.valdi.callable.ValdiFunction
import com.snap.valdi.views.ValdiTouchEventResult
import com.snap.valdi.views.ValdiTouchTarget

class ValdiFilePicker(context: Context) : LinearLayout(context), ValdiTouchTarget {

    var onSelectFunction: ValdiFunction? = null
    var allowMultiple: Boolean = false
    var accept: String? = null

    private val pickButton: Button

    init {
        orientation = HORIZONTAL
        gravity = Gravity.CENTER
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        minimumHeight = 56
        setBackgroundColor(Color.TRANSPARENT)

        pickButton = Button(context).apply {
            text = "Choose file…"
            setOnClickListener { launchFilePicker() }
        }
        addView(pickButton)
    }

    private fun resolveActivity(): Activity? {
        var ctx: Context? = context
        while (ctx != null) {
            if (ctx is Activity) return ctx
            ctx = (ctx as? ContextWrapper)?.baseContext
        }
        var v: View? = this
        while (v != null) {
            var c: Context? = v.context
            while (c != null) {
                if (c is Activity) return c
                c = (c as? ContextWrapper)?.baseContext
            }
            v = (v.parent as? View)
        }
        return null
    }

    private fun launchFilePicker() {
        val activity = resolveActivity() ?: return
        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = accept ?: "*/*"
                addCategory(Intent.CATEGORY_OPENABLE)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, allowMultiple)
            }
            activity.startActivity(Intent.createChooser(intent, "Select file"))
        } catch (_: Exception) { }
    }

    override fun processTouchEvent(event: MotionEvent): ValdiTouchEventResult {
        val consumed = dispatchTouchEvent(event)
        return if (consumed) {
            ValdiTouchEventResult.ConsumeEventAndCancelOtherGestures
        } else {
            ValdiTouchEventResult.IgnoreEvent
        }
    }
}
