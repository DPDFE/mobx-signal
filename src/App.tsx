import { Button } from "antd";
import { useLocalObservable } from "mobx-react-lite";
import React, { memo } from "react";
import { signal, useSignal } from "./signal";

function Parent() {
  const count = useSignal(0);
  const store = useLocalObservable(() => ({
    count: 0,
    username: signal("zhangsan"),
    increment() {
      store.count++;
    },
    changeUsername() {
      store.username.value = "username" + new Date().getTime();
    },
  }));

  console.log("Parent render");

  return (
    <>
      <Button onClick={store.increment}>increment</Button>
      <Button onClick={store.changeUsername}>changeUsername</Button>
      <Button onClick={() => count.value++}>changeCountSignal</Button>
      <Child store={store} />
      <MemoChild store={store} />
      <FunctionalChild>
        {() => {
          return store.count;
        }}
      </FunctionalChild>
      <ForwardRefChild store={store} />
      <SignalChild store={store} />
      useSignal: {count}
    </>
  );
}

function Child({ store }: any) {
  console.log("Child render");
  return <div>Child: {store.count}</div>;
}

const MemoChild = memo(function ({ store }: any) {
  console.log("MemoChild render");
  return <div>Memo Child: {store.count}</div>;
});

function FunctionalChild({ children }: any) {
  console.log("FunctionalChild render");
  return <div>Functional Child: {children()}</div>;
}

const ForwardRefChild = React.forwardRef((props: any, ref: any) => {
  console.log("ForwardRefChild render");
  return <div>ForwardRef Child：{props.store.count}</div>;
});

function SignalChild({ store }: any) {
  console.log("SignalChild render");
  return <div>SignalChild Child: {store.username}</div>;
}

export default Parent;
