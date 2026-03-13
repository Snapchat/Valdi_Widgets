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
 * NOTE: WebValdiLayout.changeAttribute throws for unknown attribute names, so these
 * factories are static (mount-time only). Runtime attribute binding requires a framework
 * fix in Valdi. See plan: valdi-web-custom-view-attributes.md
 */

// ─── DatePicker ──────────────────────────────────────────────────────────────

function createDatePickerFactory() {
  return function (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    var input = document.createElement('input');
    input.type = 'date';
    input.style.fontSize = '16px';
    input.style.padding = '8px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '6px';
    input.style.cursor = 'pointer';
    container.appendChild(input);
  };
}

// ─── TimePicker ──────────────────────────────────────────────────────────────

function createTimePickerFactory() {
  return function (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    var input = document.createElement('input');
    input.type = 'time';
    input.style.fontSize = '16px';
    input.style.padding = '8px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '6px';
    input.style.cursor = 'pointer';
    container.appendChild(input);
  };
}

// ─── IndexPicker ─────────────────────────────────────────────────────────────

function createIndexPickerFactory() {
  return function (container) {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    var select = document.createElement('select');
    select.style.fontSize = '16px';
    select.style.padding = '8px';
    select.style.border = '1px solid #ccc';
    select.style.borderRadius = '6px';
    select.style.cursor = 'pointer';
    select.style.minWidth = '120px';

    var placeholder = document.createElement('option');
    placeholder.textContent = '\u2014'; // em dash placeholder
    select.appendChild(placeholder);

    container.appendChild(select);
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
  };
}

// ─── Registry export ─────────────────────────────────────────────────────────

exports.webPolyglotViews = {
  SCWidgetsDatePickerWeb: createDatePickerFactory(),
  SCWidgetsTimePickerWeb: createTimePickerFactory(),
  SCWidgetsIndexPickerWeb: createIndexPickerFactory(),
  SCWidgetsLabelWeb: createLabelFactory(),
};
