/**
 *@param {DOMRectReadOnly} rect1 
 *@param {DOMRectReadOnly} rect2 
 *@returns {boolean}
 * */
export function isColiding(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x
        && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y)
}

/**
 *@param {DOMRectReadOnly} rect1 
 *@param {DOMRectReadOnly} rect2 
 *@returns {boolean}
 * */
export function isSurrounding(rect1, rect2) {
    return (rect1.left >= rect2.left && rect1.right <= rect2.right
        && rect1.top >= rect2.top && rect1.right <= rect2.right)
}

