const ARRAY_SIZE = 7;

const dropDiv = document.createElement("div");
dropDiv.style.position = "absolute";
dropDiv.style.left = "400px";
dropDiv.style.width = "700px";
dropDiv.style.height = "1000px";
dropDiv.style.background = "gray";
dropDiv.style.border = "1px solid black";

document.body.appendChild(dropDiv);

document.addEventListener("mousemove", dragMove);
document.addEventListener("mouseup", dragEnd);

/**@type {HTMLDivElement[]}*/
const elems = Array(ARRAY_SIZE);

/**@type {number[][]}*/
const groups = Array(ARRAY_SIZE).fill(Array(1)).map((_, i) => [i]);

/**@type {number[]}*/
const parents = Array(ARRAY_SIZE).fill(-1);;

for (let i = 0; i < ARRAY_SIZE; i++) {
    const elem = document.createElement("div");
    elem.id = `div${i + 1}`;
    elem.style.width = "50px";
    elem.style.height = "50px";
    if (i % 2 === 0) {
        elem.style.background = "red";
    } else {
        elem.style.background = "yellow";
    }
    elem.onmousedown = dragStart;
    elems[i] = elem;
    document.body.appendChild(elem);
}

/**@type {HTMLDivElement | null}*/
let curr = null;
let currIndex = -1;
let currCords = { left: "0px", right: "0px" };

/**
 * @param {any[]} arr 
 * @param {any} val 
 */
function removeElem(arr, val) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            for (let j = i; j < arr.length - 1; j++) {
                arr[j] = arr[j + 1];
            }
            arr.pop();
            break;
        }
    }
}

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
 *@param {DOMRectReadOnly} rect1 
 *@param {DOMRectReadOnly} rect2 
 *@returns {boolean}
 * */
function isSurrounding(rect1, rect2) {
    return (rect1.left >= rect2.left && rect1.right <= rect2.right
        && rect1.top >= rect2.top && rect1.right <= rect2.right)
}

/**
 * Handles the `mousedown` event for a draggable element.
 * 
 * @this {HTMLDivElement} The div element where the `mousedown` event occurred.
 * @param {MouseEvent} event - The event object representing the `mousedown` event.
 */
function dragStart(event) {
    this.style.border = "2px solid black";
    curr = this;
    currCords.left = curr.style.left;
    currCords.right = curr.style.right;
    curr.style.position = "absolute";
    currIndex = Number(this.id.replace("div", "")) - 1;
};

function recurseMove(currIndex, mult, clientX, clientY, parent) {
    console.log(currIndex, groups[currIndex]);
    for (let i = parent === -1 ? 0 : 1; i < groups[currIndex].length; i++) {
        const index = groups[currIndex][i];
        const elem = elems[index];
        const rect = elem.getBoundingClientRect();
        elem.style.left = `${clientX - rect.width / 2}px`;
        elem.style.top = `${clientY - rect.height / 2 + mult * 50}px`;
        mult++;
        if (groups[index].length > 0) {
            recurseMove(index, mult, clientX, clientY, index);
        }
    }
}

/**
 * Handles the `mousedown` event for a draggable element.
 * 
 * @param {MouseEvent} event - The event object representing the `mousedown` event.
 */
function dragMove(event) {
    if (curr === null) return;

    let mult = 0;
    recurseMove(currIndex, mult, event.clientX, event.clientY, -1);
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
    curr.style.opacity = "100%";
    const rect = curr.getBoundingClientRect();
    for (let i = 0; i < elems.length; i++) {
        if (i === currIndex) continue;
        const rect2 = elems[i].getBoundingClientRect();

        if (isColiding(rect, rect2) && (i & 1) !== (currIndex & 1)) {
            /*
            parents[currIndex] = i;
            for (let j = 0; j < groups[currIndex].length; j++) {
                const elem = elems[groups[currIndex][j]];
                const rect2 = elem.getBoundingClientRect();
                elem.style.top = `${rect2.bottom + i * 50}px`;
                elem.style.left = `${rect2.left}px`;
                groups[i].push(groups[currIndex][j]);
            }
            console.log(groups[i]);
            break;
            */
            curr.style.top = `${rect2.bottom}px`;
            curr.style.left = `${rect2.left}px`;
            groups[i].push(currIndex);
        } else {
            removeElem(groups[i], currIndex);
        }
    }

    if (!isSurrounding(rect, dropDiv.getBoundingClientRect())) {
        curr.style.position = "initial";
        curr.style.left = currCords.left;
        curr.style.right = currCords.right;
    }
    currCords = { left: "0px", right: "0px" };
    curr = null;
    currIndex = -1;
};
