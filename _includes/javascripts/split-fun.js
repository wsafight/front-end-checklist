// bad
const initial = async () => {
    // 获取数据信息
    // ...

    // 验证过滤并修改数据信息
    // ...

    // 设置渲染
    // ...

    // 其他操作
}

// good
initial = async () => {
    // 在初始化时候获取数据
    const data = await this.getDataWhenInitial();
    // 验证以及格式化当前数据
    this.validateAndNormalizeData(data)
    // 比对然后同步当前数据
    this.diffThenSyncData(data)
}
