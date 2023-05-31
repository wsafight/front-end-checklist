// bad
let time = 1

time = time + await getTime()

// good
let time = 1
const oldTime = await getTime()
time = time + oldTime
