import { makeAutoObservable, observable } from "mobx";
import { observer, Observer } from "mobx-react-lite";

import React, { FunctionComponent, useMemo } from "react";
import jsxRuntimeDev from "react/jsx-dev-runtime";
import jsxRuntime from "react/jsx-runtime";

// some codes from https://github.com/preactjs/signals/blob/main/packages/react/src/index.ts
const ObserverComponents = new WeakMap<
  FunctionComponent<any>,
  FunctionComponent<any>
>();

type AddObserverIf = (component: FunctionComponent<unknown>) => boolean;
let addObserverIf: AddObserverIf | undefined;

function ObserverFunctionalComponent(Component: FunctionComponent<unknown>) {
  if (ObserverComponents.get(Component)) {
    return ObserverComponents.get(Component);
  }

  if (Component.prototype?.isReactComponent) {
    /*
    we do not care about class components
    if you do care, do this:
    import { observer as observerClass } from "mobx-react";
    ObserverComponent = observerClass(Component)
    */
    return Component;
  }

  if (!addObserverIf?.(Component)) {
    return Component;
  }

  const ObserverComponent = observer(Component);

  ObserverComponents.set(Component, ObserverComponent);
  ObserverComponents.set(ObserverComponent, ObserverComponent);

  return ObserverComponent;
}

function WrapJsx<T>(jsx: T): T {
  if (typeof jsx !== "function") return jsx;

  return function (type: any, props: any, ...rest: any[]) {
    let Component = type;

    if (typeof type === "function" && !(type instanceof Component)) {
      Component = ObserverFunctionalComponent(type);
    }

    if (typeof type === "object" && type?.$$typeof) {
      switch (type.$$typeof) {
        case Symbol.for("react.memo"):
          type.type = ObserverFunctionalComponent(type.type);
          break;
        case Symbol.for("react.forward_ref"):
          Component = ObserverFunctionalComponent(type);
          break;
        default:
          break;
      }
    }

    return jsx.call(jsx, Component, props, ...rest);
  } as any as T;
}

export interface JsxRuntimeModule {
  jsx?(type: any, ...rest: any[]): unknown;

  jsxs?(type: any, ...rest: any[]): unknown;

  jsxDEV?(type: any, ...rest: any[]): unknown;
}

export function enableAutoWrapObserver(options: {
  addObserverIf: AddObserverIf;
}) {
  const JsxPro: JsxRuntimeModule = jsxRuntime;
  const JsxDev: JsxRuntimeModule = jsxRuntimeDev;

  addObserverIf = options.addObserverIf;

  React.createElement = WrapJsx(React.createElement);
  JsxDev.jsx && /*   */ (JsxDev.jsx = WrapJsx(JsxDev.jsx));
  JsxPro.jsx && /*   */ (JsxPro.jsx = WrapJsx(JsxPro.jsx));
  JsxDev.jsxs && /*  */ (JsxDev.jsxs = WrapJsx(JsxDev.jsxs));
  JsxPro.jsxs && /*  */ (JsxPro.jsxs = WrapJsx(JsxPro.jsxs));
  JsxDev.jsxDEV && /**/ (JsxDev.jsxDEV = WrapJsx(JsxDev.jsxDEV));
  JsxPro.jsxDEV && /**/ (JsxPro.jsxDEV = WrapJsx(JsxPro.jsxDEV));
}

class Signal<T> {
  value: T;

  constructor(value: T) {
    this.value = value;
    makeAutoObservable(this, { value: observable });
  }
}

export function signal<T>(value: T) {
  return new Signal<T>(value);
}

function Text<T>({ data }: { data: Signal<T> }) {
  return <Observer>{() => data.value as any}</Observer>;
}

Object.defineProperties(Signal.prototype, {
  $$typeof: { configurable: true, value: Symbol.for("react.element") },
  type: { configurable: true, value: Text },
  props: {
    configurable: true,
    get() {
      return { data: this };
    },
  },
  ref: { configurable: true, value: null },
});

export function useSignal<T>(value: T) {
  return useMemo(() => signal<T>(value), []);
}
