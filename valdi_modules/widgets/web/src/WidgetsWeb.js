/**
 * Web polyglot implementations for Widgets custom views.
 *
 * Exports webPolyglotViews — the build system's generate_register_native_modules picks this up
 * and registers each factory with the web view class registry at bundle load time.
 *
 * Class names must match the webClass attributes in the corresponding TSX components:
 *   DatePicker    → SCWidgetsDatePickerWeb
 *   TimePicker    → SCWidgetsTimePickerWeb
 *   IndexPicker   → SCWidgetsIndexPickerWeb
 *   EmojiLabel    → SCWidgetsLabelWeb
 *
 * Each factory returns an object with a changeAttribute(name, value) method so the
 * web renderer can forward attribute updates from the component tree.
 */

// ─── DatePicker ──────────────────────────────────────────────────────────────

function createDatePickerFactory() {
  return function (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.pointerEvents = 'auto';

    var input = document.createElement('input');
    input.type = 'date';
    input.style.fontSize = '16px';
    input.style.padding = '8px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '6px';
    input.style.cursor = 'pointer';
    input.style.pointerEvents = 'auto';
    container.appendChild(input);

    var onChange = null;

    input.addEventListener('change', function () {
      if (onChange) {
        var dateSeconds = new Date(input.value).getTime() / 1000;
        onChange({ dateSeconds: dateSeconds });
      }
    });

    return {
      changeAttribute: function (name, value) {
        if (name === 'dateSeconds' && typeof value === 'number') {
          var d = new Date(value * 1000);
          input.value = d.toISOString().split('T')[0];
        } else if (name === 'minimumDateSeconds' && typeof value === 'number') {
          var d = new Date(value * 1000);
          input.min = d.toISOString().split('T')[0];
        } else if (name === 'maximumDateSeconds' && typeof value === 'number') {
          var d = new Date(value * 1000);
          input.max = d.toISOString().split('T')[0];
        } else if (name === 'onChange') {
          onChange = typeof value === 'function' ? value : null;
        }
      },
    };
  };
}

// ─── TimePicker ──────────────────────────────────────────────────────────────

function createTimePickerFactory() {
  return function (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.pointerEvents = 'auto';

    var input = document.createElement('input');
    input.type = 'time';
    input.style.fontSize = '16px';
    input.style.padding = '8px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '6px';
    input.style.cursor = 'pointer';
    input.style.pointerEvents = 'auto';
    container.appendChild(input);

    var onChange = null;

    input.addEventListener('change', function () {
      if (onChange) {
        var parts = input.value.split(':');
        onChange({ hourOfDay: parseInt(parts[0], 10), minuteOfHour: parseInt(parts[1], 10) });
      }
    });

    return {
      changeAttribute: function (name, value) {
        if (name === 'hourOfDay' && typeof value === 'number') {
          var parts = (input.value || '00:00').split(':');
          parts[0] = String(value).padStart(2, '0');
          input.value = parts.join(':');
        } else if (name === 'minuteOfHour' && typeof value === 'number') {
          var parts = (input.value || '00:00').split(':');
          parts[1] = String(value).padStart(2, '0');
          input.value = parts.join(':');
        } else if (name === 'onChange') {
          onChange = typeof value === 'function' ? value : null;
        }
      },
    };
  };
}

// ─── IndexPicker ─────────────────────────────────────────────────────────────

function createIndexPickerFactory() {
  return function (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.pointerEvents = 'auto';

    var select = document.createElement('select');
    select.style.fontSize = '16px';
    select.style.padding = '8px';
    select.style.border = '1px solid #ccc';
    select.style.borderRadius = '6px';
    select.style.cursor = 'pointer';
    select.style.minWidth = '120px';
    select.style.pointerEvents = 'auto';
    container.appendChild(select);

    var onChange = null;
    var currentLabels = [];
    var currentIndex = 0;

    select.addEventListener('change', function () {
      if (onChange) {
        onChange(select.selectedIndex);
      }
    });

    function rebuildOptions() {
      select.innerHTML = '';
      for (var i = 0; i < currentLabels.length; i++) {
        var opt = document.createElement('option');
        opt.textContent = currentLabels[i];
        opt.value = String(i);
        select.appendChild(opt);
      }
      if (currentLabels.length > 0) {
        var clamped = Math.max(0, Math.min(currentIndex, currentLabels.length - 1));
        select.selectedIndex = clamped;
      }
    }

    return {
      changeAttribute: function (name, value) {
        if (name === 'content' && Array.isArray(value)) {
          // Composite attribute: [index, labels]
          var index = value[0];
          var labels = value[1];
          if (typeof index === 'number') currentIndex = index;
          if (Array.isArray(labels)) currentLabels = labels;
          rebuildOptions();
        } else if (name === 'index' && typeof value === 'number') {
          currentIndex = value;
          rebuildOptions();
        } else if (name === 'labels' && Array.isArray(value)) {
          currentLabels = value;
          rebuildOptions();
        } else if (name === 'onChange') {
          onChange = typeof value === 'function' ? value : null;
        }
      },
    };
  };
}

// ─── EmojiLabel ──────────────────────────────────────────────────────────────

function createLabelFactory() {
  return function (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    var span = document.createElement('span');
    span.style.fontSize = 'inherit';
    span.style.lineHeight = 'inherit';
    container.appendChild(span);

    return {
      changeAttribute: function (name, value) {
        if (name === 'value' && (typeof value === 'string' || value == null)) {
          span.textContent = value || '';
        } else if (name === 'color' && typeof value === 'number') {
          var r = (value >> 24) & 0xff;
          var g = (value >> 16) & 0xff;
          var b = (value >> 8) & 0xff;
          var a = (value & 0xff) / 255;
          span.style.color = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        } else if (name === 'numberOfLines' && typeof value === 'number') {
          if (value > 0) {
            span.style.display = '-webkit-box';
            span.style.webkitLineClamp = String(value);
            span.style.webkitBoxOrient = 'vertical';
            span.style.overflow = 'hidden';
          } else {
            span.style.display = '';
            span.style.webkitLineClamp = '';
            span.style.webkitBoxOrient = '';
            span.style.overflow = '';
          }
        }
      },
    };
  };
}

// ─── Registry export ─────────────────────────────────────────────────────────

exports.webPolyglotViews = {
  SCWidgetsDatePickerWeb: createDatePickerFactory(),
  SCWidgetsTimePickerWeb: createTimePickerFactory(),
  SCWidgetsIndexPickerWeb: createIndexPickerFactory(),
  SCWidgetsLabelWeb: createLabelFactory(),
};
