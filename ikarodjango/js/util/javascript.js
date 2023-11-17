
export const snake_to_title = str =>
    str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ')

export const two_dec = num => Math.trunc(num * 100) / 100

export const format_ms = duration => {
    let seconds = Math.floor((duration / 1000) % 60)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    hours = (hours < 10) ? "0" + hours : hours
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds

    return hours + ":" + minutes + ":" + seconds
}

export const arrayToObject = (arr) => arr.reduce((acc, elem, idx) => ({...acc, [elem]: idx}), {})
