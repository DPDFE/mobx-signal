# mobx-signal

```
npm install @dpdfe/mobx-signal
```

本库有两个独立的功能：

## 自动包裹 observer()

为您的组件自动包裹 observer()

在入口文件中引入：

```typescript
import { enableAutoWrapObserver } from "@dpdfe/mobx-signal";

enableAutoWrapObserver({
  // 自动包裹策略
  // 如果要自动全包裹，则直接return true
  // 如果指定某些情况才包裹，可以根据传入的组件进行包裹。
  // 如第三方库antd等都不要包裹，仅我们自己的组件包裹。
  // 可配合webpack插件等，将你src目录中的组件的displayName自动添加$$$
  // 如：若函数组件的函数名以$$$结尾才包裹：
  // return Component.name.endsWith('$$$') || Component.displayName.endsWith('$$$')
  addObserverIf(Component) {
    return true;
  }
});
```

## signal

注意，不需要上述方法中的自动包裹 observer()，您也可以使用 signal。

有两种方法：使用 useSignal 创建，或使用 signal() 配合 useLocalObservable 在 hooks 组件中创建；

### useSignal

直接使用 {count}，不要使用 {count.value}，以达到最高性能。

```tsx
import { useSignal } from "@dpdfe/mobx-signal";

export default function App() {
  const count = useSignal(0);
  console.log("Parent render");

  return (
    <>
      <button onClick={count.value++}>increment</button>
      useSignal: {count}
    </>
  );
}
```

### signal()

可以看到在点击按钮时，父子组件均不会重新渲染(父子里面的console.log在点击按钮时，均不会打印)，仅 {store.username} 部分会重新渲染。

```tsx
import { signal } from "@dpdfe/mobx-signal";

function Parent() {
  const store = useLocalObservable(() => ({
    username: signal("zhangsan"),
    changeUsername() {
      store.username.value = "username" + new Date().getTime();
    },
  }));

  console.log("Parent render");

  return (
    <>
      <button onClick={store.changeUsername}>changeUsername</button>
      <SignalChild store={store} />
    </>
  );
}


function SignalChild({ store }: any) {
  console.log("SignalChild render");
  return <div>SignalChild Child: {store.username}</div>;
}

export default Parent;
```

