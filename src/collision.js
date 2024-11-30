/**
 *@param {Coordinates} coord1 
 *@param {Coordinates} coord2 
 *@returns {boolean}
 * */
export function isColiding(coord1, coord2) {
    return (coord1.x1 < coord2.x2 && coord1.x2 > coord2.x1
        && coord1.y1 < coord2.y2 && coord1.y2 > coord2.y1);
}

/**
 *@param {number} x1 
 *@param {number} y1 
 *@param {number} x2 
 *@param {number} y2 
 *@param {number} offset
 *@returns {boolean}
 * **/
export function isColidingOffset(x1, y1, x2, y2, offset) {
    return (x1 < x2 + offset && x1 + offset > x2
        && y1 < y2 + offset && y1 + offset > y2);
}

/**
 *@param {Coordinates} coord1 
 *@param {Coordinates} coord2 
 *@returns {boolean}
 * */
export function isSurrounding(coord1, coord2) {
    return (coord1.x1 >= coord2.x1 && coord1.x2 <= coord2.x2
        && coord1.y1 >= coord2.y1 && coord1.y2 <= coord2.y2);
}


