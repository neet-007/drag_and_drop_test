/**
 *@param {Coordinates} coord1 
 *@param {Coordinates} coord2 
 *@returns {boolean}
 * */
export function isColiding(coord1, coord2) {
    return (coord1.x1 < coord2.x2 && coord1.x2 > coord2.x1
        && coord1.y1 < coord2.y2 && coord1.y2 > coord2.y1)
}

/**
 *@param {Coordinates} coord1 
 *@param {Coordinates} coord2 
 *@returns {boolean}
 * */
export function isSurrounding(coord1, coord2) {
    return (coord1.x1 >= coord2.x1 && coord1.x2 <= coord2.x2
        && coord1.y1 >= coord2.y1 && coord1.y2 <= coord2.y2)
}

