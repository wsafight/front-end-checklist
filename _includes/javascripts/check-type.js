// bad
const { firstName, age, addresses } = params
submit({
    firstName,
    age,
    addresses,
    ...secondaryInfo,
})

// good
const { firstName, age, addresses } = params
if (!firstName || typeof firstName !== 'string') {
    // 提示错误
    return
}
if (!Array.isArray(addresses) || addresses.length === 0) {
    // 提示错误
    return
}
submit({
    firstName,
    age,
    ...secondaryInfo,
})

// 注：以下为 lua 代码，没有检查 b 变量的类型是 2021.07.13 B站宕机事故的主要原因
// 具体可看 [B站宕机事故复盘：2021.07.13 我们是这样崩的](https://cloud.tencent.com/developer/article/2251012)

local _gcd
_gcd = function (a, b)
    if b == 0 then
        return a
    end
    return _gcd(b, a% b)
end
