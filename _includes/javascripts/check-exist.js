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
if (!firstName) {
    // 提示错误
    return
}
if (addresses.length === 0) {
    // 提示错误
    return
}
submit({
    firstName,
    age,
    ...secondaryInfo,
})
