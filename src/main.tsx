import "antd/dist/antd.css";
import React from "react";
import ReactDOM from "react-dom/client";
import Parent from "./App";
import { enableAutoWrapObserver } from "./signal";
import "./styles.css";

enableAutoWrapObserver({
  /**
   * 自动包裹策略
   *
   * @param Component - 函数组件
   */
  addObserverIf(Component) {
    // 若所有组件都包裹，则直接return true。
    return true;

    // 若指定某些情况才包裹，可以根据传入的组件进行包裹。
    // 如第三方库antd等都不包裹，仅我们自己的组件包裹。
    // 可配合webpack插件等，将你src目录中的组件的displayName自动后缀$MobxAutoObserver
    // 如：若函数组件的函数名以 $MobxAutoObserver 结尾才包裹：
    // return Component.name?.endsWith('$MobxAutoObserver') ||
    //        Component.displayName?.endsWith('$MobxAutoObserver')
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Parent />
);
