
export const snake_to_title = str =>
    str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ')

export const two_dec = num => Math.trunc(num * 100) / 100
