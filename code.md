```js
function ParentComponent() {
  function ChildComponent() {
    return <div>Hi</div>;
  }

  return <ChildComponent />;
}
```

```js
function ChildComponent() {
  return <div>Hi</div>;
}

function ParentComponent() {
  return <ChildComponent />;
}
```