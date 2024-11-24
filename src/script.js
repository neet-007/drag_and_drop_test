const div1 = document.createElement("div");
const div2 = document.createElement("div");
const div3 = document.createElement("div");

div1.id = "div1";
div2.id = "div2";
div3.id = "div3";

div1.style.position = "absolute";
div2.style.position = "absolute";
div3.style.position = "absolute";

div1.style.width = "50px";
div1.style.height = "50px";
div1.style.background = "red";
div2.style.width = "50px";
div2.style.height = "50px";
div2.style.background = "red";
div3.style.width = "50px";
div3.style.height = "50px";
div3.style.background = "red";

div1.onmousedown = dragStart;
div2.onmousedown = dragStart;
div3.onmousedown = dragStart;

document.addEventListener("mousemove", dragMove);
document.addEventListener("mouseup", dragEnd);

const elems = [div1, div2];

for (let i = 0; i < elems.length; i++) {
    document.body.appendChild(elems[i]);
}

/**@type {HTMLDivElement | null}*/
let curr = null;
let currIndex = -1;

/**
 * Handles the `mousedown` event for a draggable element.
 * 
 * @this {HTMLDivElement} The div element where the `mousedown` event occurred.
 * @param {MouseEvent} event - The event object representing the `mousedown` event.
 */
function dragStart(event) {
    this.style.border = "2px solid black";
    curr = this;
    currIndex = Number(this.id.replace("div", "")) - 1;
};

/**
 *@param {DOMRectReadOnly} rect1 
 *@param {DOMRectReadOnly} rect2 
 *@returns {boolean}
 * */
function isColiding(rect1, rect2) {
    return (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x
        && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y)
}

/**
 * Handles the `mousedown` event for a draggable element.
 * 
 * @param {MouseEvent} event - The event object representing the `mousedown` event.
 */
function dragMove(event) {
    if (curr === null) return;
    const rect = curr.getBoundingClientRect();
    curr.style.left = `${event.clientX - (rect.width / 2)}px`;
    curr.style.top = `${event.clientY - (rect.height / 2)}px`;

    for (let i = 0; i < elems.length; i++) {
        if (i === currIndex) continue;
        const rect2 = elems[i].getBoundingClientRect();

        if (isColiding(rect, rect2)) {
            curr.style.background = "blue";
        } else {
            curr.style.background = "red";
        }

    }
}

/**
 * Handles the `mouseup` event for a draggable element.
 * 
 * @this {HTMLDivElement} The div element where the `mouseup` event occurred.
 * @param {MouseEvent} event - The event object representing the `mouseup` event.
 */
function dragEnd(event) {
    if (curr === null) return;
    curr.style.border = "";
    curr = null;
    currIndex = -1;
};
