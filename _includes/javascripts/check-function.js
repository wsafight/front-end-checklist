const OBJECT_TYPE = '[object Object]'

const isRealObject = (val) => getType(val) === OBJECT_TYPE


// bad
const getOwnKeysForObj = (val) => {
    if (!val) {
      return
    }

    if (!isRealObject(val)) {
      return
    }

    return Object.keys(val).filter(key => val.hasOwnProperty(key))
}

// good
const getOwnKeysForObj = (val) => {
    if (!val) {
      return []
    }

    if (!isRealObject(val)) {
      return []
    }

    return Object.keys(val).filter(key => val.hasOwnProperty(key))
}
