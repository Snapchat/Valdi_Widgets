import { getModuleLoader } from 'valdi_core/src/ModuleLoaderGlobal';

export function registerSemanticColors(): void {
  getModuleLoader().onModuleRegistered('DeviceBridge', () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import('./InitSemanticColors').then(cb => {
      cb.initializeSemanticColors();
    });
  });
}
