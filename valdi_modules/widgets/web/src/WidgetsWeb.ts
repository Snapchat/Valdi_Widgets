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

interface AttributeHandler {
  changeAttribute(name: string, value: unknown): void;
}

type ViewFactory = (container: HTMLElement) => AttributeHandler;

// ─── DatePicker ──────────────────────────────────────────────────────────────

function createDatePickerFactory(): ViewFactory {
  return (container: HTMLElement): AttributeHandler => {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.pointerEvents = 'auto';

    const input = document.createElement('input');
    input.type = 'date';
    input.style.fontSize = '16px';
    input.style.padding = '8px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '6px';
    input.style.cursor = 'pointer';
    input.style.pointerEvents = 'auto';
    container.appendChild(input);

    let onChange: ((result: { dateSeconds: number }) => void) | null = null;

    input.addEventListener('change', () => {
      if (onChange) {
        const dateSeconds = new Date(input.value).getTime() / 1000;
        onChange({ dateSeconds });
      }
    });

    return {
      changeAttribute(name: string, value: unknown): void {
        if (name === 'dateSeconds' && typeof value === 'number') {
          const d = new Date(value * 1000);
          input.value = d.toISOString().split('T')[0];
        } else if (name === 'minimumDateSeconds' && typeof value === 'number') {
          const d = new Date(value * 1000);
          input.min = d.toISOString().split('T')[0];
        } else if (name === 'maximumDateSeconds' && typeof value === 'number') {
          const d = new Date(value * 1000);
          input.max = d.toISOString().split('T')[0];
        } else if (name === 'onChange') {
          onChange = typeof value === 'function' ? (value as (result: { dateSeconds: number }) => void) : null;
        }
      },
    };
  };
}

// ─── TimePicker ──────────────────────────────────────────────────────────────

function createTimePickerFactory(): ViewFactory {
  return (container: HTMLElement): AttributeHandler => {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.pointerEvents = 'auto';

    const input = document.createElement('input');
    input.type = 'time';
    input.style.fontSize = '16px';
    input.style.padding = '8px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '6px';
    input.style.cursor = 'pointer';
    input.style.pointerEvents = 'auto';
    container.appendChild(input);

    let onChange: ((result: { hourOfDay: number; minuteOfHour: number }) => void) | null = null;

    input.addEventListener('change', () => {
      if (onChange) {
        const parts = input.value.split(':');
        onChange({ hourOfDay: parseInt(parts[0], 10), minuteOfHour: parseInt(parts[1], 10) });
      }
    });

    return {
      changeAttribute(name: string, value: unknown): void {
        if (name === 'hourOfDay' && typeof value === 'number') {
          const parts = (input.value || '00:00').split(':');
          parts[0] = String(value).padStart(2, '0');
          input.value = parts.join(':');
        } else if (name === 'minuteOfHour' && typeof value === 'number') {
          const parts = (input.value || '00:00').split(':');
          parts[1] = String(value).padStart(2, '0');
          input.value = parts.join(':');
        } else if (name === 'onChange') {
          onChange = typeof value === 'function' ? (value as (result: { hourOfDay: number; minuteOfHour: number }) => void) : null;
        }
      },
    };
  };
}

// ─── IndexPicker ─────────────────────────────────────────────────────────────

function createIndexPickerFactory(): ViewFactory {
  return (container: HTMLElement): AttributeHandler => {
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.pointerEvents = 'auto';

    const select = document.createElement('select');
    select.style.fontSize = '16px';
    select.style.padding = '8px';
    select.style.border = '1px solid #ccc';
    select.style.borderRadius = '6px';
    select.style.cursor = 'pointer';
    select.style.minWidth = '120px';
    select.style.pointerEvents = 'auto';
    container.appendChild(select);

    let onChange: ((index: number) => void) | null = null;
    let currentLabels: string[] = [];
    let currentIndex = 0;

    select.addEventListener('change', () => {
      if (onChange) {
        onChange(select.selectedIndex);
      }
    });

    function rebuildOptions(): void {
      select.innerHTML = '';
      for (let i = 0; i < currentLabels.length; i++) {
        const opt = document.createElement('option');
        opt.textContent = currentLabels[i];
        opt.value = String(i);
        select.appendChild(opt);
      }
      if (currentLabels.length > 0) {
        const clamped = Math.max(0, Math.min(currentIndex, currentLabels.length - 1));
        select.selectedIndex = clamped;
      }
    }

    return {
      changeAttribute(name: string, value: unknown): void {
        if (name === 'content' && Array.isArray(value)) {
          const index = value[0] as number;
          const labels = value[1] as string[];
          if (typeof index === 'number') currentIndex = index;
          if (Array.isArray(labels)) currentLabels = labels;
          rebuildOptions();
        } else if (name === 'index' && typeof value === 'number') {
          currentIndex = value;
          rebuildOptions();
        } else if (name === 'labels' && Array.isArray(value)) {
          currentLabels = value as string[];
          rebuildOptions();
        } else if (name === 'onChange') {
          onChange = typeof value === 'function' ? (value as (index: number) => void) : null;
        }
      },
    };
  };
}

// ─── EmojiLabel ──────────────────────────────────────────────────────────────

function createLabelFactory(): ViewFactory {
  return (container: HTMLElement): AttributeHandler => {
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    const span = document.createElement('span');
    span.style.fontSize = 'inherit';
    span.style.lineHeight = 'inherit';
    container.appendChild(span);

    return {
      changeAttribute(name: string, value: unknown): void {
        if (name === 'value' && (typeof value === 'string' || value == null)) {
          span.textContent = (value as string) || '';
        } else if (name === 'color' && typeof value === 'number') {
          const r = (value >> 24) & 0xff;
          const g = (value >> 16) & 0xff;
          const b = (value >> 8) & 0xff;
          const a = (value & 0xff) / 255;
          span.style.color = `rgba(${r},${g},${b},${a})`;
        } else if (name === 'numberOfLines' && typeof value === 'number') {
          if (value > 0) {
            span.style.display = '-webkit-box';
            (span.style as any).webkitLineClamp = String(value);
            (span.style as any).webkitBoxOrient = 'vertical';
            span.style.overflow = 'hidden';
          } else {
            span.style.display = '';
            (span.style as any).webkitLineClamp = '';
            (span.style as any).webkitBoxOrient = '';
            span.style.overflow = '';
          }
        }
      },
    };
  };
}

// ─── Registry export ─────────────────────────────────────────────────────────

export const webPolyglotViews: Record<string, ViewFactory> = {
  SCWidgetsDatePickerWeb: createDatePickerFactory(),
  SCWidgetsTimePickerWeb: createTimePickerFactory(),
  SCWidgetsIndexPickerWeb: createIndexPickerFactory(),
  SCWidgetsLabelWeb: createLabelFactory(),
};
