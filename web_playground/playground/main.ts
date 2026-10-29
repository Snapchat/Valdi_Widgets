import { ComponentPrototype, ValdiWebRenderer } from './setup';

const { WIDGET_DEMOS, findWidgetDemo } = require('valdi_widgets_web_npm/src/widgets_demos/src/DemoRegistry');

interface WidgetDemo {
  id: string;
  title: string;
  description: string;
  component: unknown;
}

interface MountedDemo {
  id: string;
  renderer: { destroy(): void };
}

const demos: WidgetDemo[] = WIDGET_DEMOS;
let mounted: MountedDemo | undefined;

function setStatus(status: 'success' | 'error', error: string | null): void {
  (window as any).valdiTestStatus = status;
  (window as any).__valdiTestBootstrapStatus = { loaded: status === 'success', error };
}

function currentDemoId(): string {
  const id = window.location.hash.replace(/^#\/?/, '');
  return findWidgetDemo(id) ? id : demos[0].id;
}

function renderNav(nav: HTMLElement, activeId: string): void {
  nav.innerHTML = '<h1>Valdi Widgets</h1><p>Rendered by the Valdi web renderer</p>';
  for (const demo of demos) {
    const link = document.createElement('a');
    link.href = `#/${demo.id}`;
    link.dataset.demoId = demo.id;
    link.textContent = demo.title;
    const description = document.createElement('small');
    description.textContent = demo.description;
    link.appendChild(description);
    if (demo.id === activeId) {
      link.setAttribute('aria-current', 'page');
    }
    nav.appendChild(link);
  }
}

function mountDemo(device: HTMLElement, id: string): void {
  if (mounted) {
    mounted.renderer.destroy();
    mounted = undefined;
  }
  // A shadow root can only be attached once, so each demo gets a fresh host element.
  device.innerHTML = '';
  const host = document.createElement('div');
  host.dataset.demoId = id;
  device.appendChild(host);

  const demo = findWidgetDemo(id) as WidgetDemo;
  const renderer = new ValdiWebRenderer(host.attachShadow({ mode: 'open' }));
  renderer.renderRootComponent(demo.component, ComponentPrototype.instanceWithNewId(), {}, {});
  mounted = { id, renderer };
  (window as any).__valdiWidgetsDemo = { current: id, ids: demos.map(d => d.id) };
}

function init(): void {
  const app = document.getElementById('app');
  if (!app) {
    setStatus('error', 'Missing #app container');
    return;
  }
  app.innerHTML = '';
  const nav = document.createElement('nav');
  nav.className = 'nav';
  const stage = document.createElement('main');
  stage.className = 'stage';
  const device = document.createElement('div');
  device.className = 'device';
  stage.appendChild(device);
  app.appendChild(nav);
  app.appendChild(stage);

  const route = (): void => {
    const id = currentDemoId();
    renderNav(nav, id);
    try {
      mountDemo(device, id);
      setStatus('success', null);
    } catch (error: any) {
      setStatus('error', error?.message ?? String(error));
      throw error;
    }
  };

  window.addEventListener('hashchange', route);
  route();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
