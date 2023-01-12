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
