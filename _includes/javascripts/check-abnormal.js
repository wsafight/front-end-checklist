// bad
const getService = (code ) => {
    if (isRealServiceByCode(code)) {
        // do something
        if (isXXX()) {
            // do something
            return services
        }
    }
    return []
}

// good
const getService = (code ) => {
    if (!isRealServiceByCode(code)) {
        return []
    }

    // do something
    if (!isXXX()) {
        return []
    }

    // do something
    return services
}
