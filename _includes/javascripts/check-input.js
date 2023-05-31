// bad
const { phone } = params
if (!phone || typeof phone !== 'string') {
    // 提示错误
    return
}
submit({
    phone
})

// good
const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') {
        return false
    }
    return /^(?:[() .+-]*\d+)+(?:[ ]?ext[ ]?\d+)?$/.test(phone)
}

const { phone } = params

if (isValidPhone(phone)) {
    // 提示错误
    return
}
submit({
    phone
})
