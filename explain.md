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

- 尽量不要使用默认导出

默认导出的第一个主要问题是命名。每次包含名称时，您都必须考虑名称导入。不仅如此，您在创建新函数时也不必想出一个好名字，因为它允许导出匿名值。

```js
// cookies.js
export default () => {
  // baking 🍪 cookies logic
};

// app.js
import makeChocolateChipCookies from "./cookie.js";
```
你不知道你的默认导出函数是cookies.js做什么的。当然，您可以查看实现或依靠文档，但这肯定会增加更多的认知负担。您无法正确识别该功能应该做什么。

这迫使您考虑在要使用它的每个地方命名该功能。
