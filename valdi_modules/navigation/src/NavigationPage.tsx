import { IComponent } from 'valdi_core/src/IComponent';

export type AnyFunction<A = any> = (...input: any[]) => A;
export type AnyConstructor<A = object> = new (...input: any[]) => A;

export type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;

/**
 * This annotation injects the componentPath static property into the class.
 *
 * The componentPath static property is used by the NavigationController to create an instance
 * of the class that a given page was configured with.
 */
export const NavigationPage =
  (module: { path: string; exports: unknown }) =>
  <T extends AnyConstructor<IComponent>>(base: T) => {
    const newClass = class extends base {
      static componentPath: string;
    };

    Object.defineProperty(newClass, 'componentPath', {
      enumerable: false,
      get() {
        const exports = module.exports as any;
        for (const exportedPropertyName in exports) {
          const property = exports[exportedPropertyName];

          if (newClass === property || Object.prototype.isPrototypeOf.call(newClass, property)) {
            return `${exportedPropertyName}@${module.path}`;
          }
        }
        throw new Error(`Could not resolve componentPath of ctor '${base.name}'`);
      },
    });
    Object.defineProperty(newClass, 'name', { value: base.name });

    return newClass;
  };
