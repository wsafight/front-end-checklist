- 钩子函数中只写调用，而不写具体逻辑代码

```js
componentDidMount () {
    this.add(a, b);
}

add = (a, b) => {
    return a + b;
}
```

- 在需要的地方使用请求，防止请求泛滥

```js
// 遇到的例子
...
const res = await xxx();
if (isNotVip()) {
    ...
    return;
}
if (res) {
    ...doSomeThing
}
...

// 修改
...
if (isNotVip()) {
    ...
    return;
}
const res = await xxx();
if (res) {
    ...doSomeThing
}
...
```
