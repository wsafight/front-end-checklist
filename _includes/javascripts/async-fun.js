// bad
const getInfo = (key) => {
    const cache = sessionStorage.getItem(key)
    if (cache) {
        return cache
    }
    return api('xxx').then(res => {
        sessionStorage.setItem(key, res)
        return res
    })
}


// good
const getInfo = (key) => {
    const cache = sessionStorage.getItem(key)
    if (cache) {
        return Promise.resolve(cache)
    }
    return api('xxx').then(res => {
        sessionStorage.setItem(key, res)
        return res
    })
}
