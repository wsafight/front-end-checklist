- 钩子函数中只写调用，而不写具体逻辑代码

```js
componentDidMount () {
    this.add(a, b);
}

add = (a, b) => {
    return a + b;
}
```
