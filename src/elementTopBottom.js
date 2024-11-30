import { isColiding, isColidingOffset, isSurrounding } from "./collision.js";
import { containerDiv, dropDiv, dropDivCoords } from "./elemnts.js";

/**@constant @type{number}**/
const ATTACH_OFFSET = 5;

/** @const @readonly */
const ComponentsEnum1 = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
}

const typeToType1 = {
    [ComponentsEnum1.A]: 0b0000000000000011,
    [ComponentsEnum1.B]: 0b0000000000000011,
    [ComponentsEnum1.C]: 0b0000000000001100,
    [ComponentsEnum1.D]: 0b0000000000001100,
}

/**
 *@param {number} parentType 
 *@param {number} childType 
 * */
function canAttach(parentType, childType) {
    const parentBits = typeToType1[parentType];
    const childBit = 1 << childType;
    return (parentBits & childBit) !== 0;
}


/** @type {number[]} @readonly */
export const componentsArray = Object.values(ComponentsEnum1);

/**@type {DragableTopBottom[]}*/
export const bases = [];

/**@type {DragableTopBottomList[]}*/
export const lists = [];

//! TODO find a better way to handle not adding  event listener to the parent thet the child is attaching to
let handling = false;
let key = 0;

class DragableTopBottomList {

    /**@type {Coordinates}**/
    coords = { x1: 0, x2: 0, y1: 0, y2: 0, width: 0, height: 0 };

    /**
     * @param {DragableTopBottom | null} head - The head object, which can be a DragableTopBottom instance or null.
     * @param {DragableTopBottom | null} tail - The tail object, which can be a DragableTopBottom instance or null.
     */
    constructor(head = null, tail = null) {
        this.head = head;
        this.tail = tail;

        if (head !== null) {
            this.fill();
        }
    }

    fill() {
        let curr = this.head;
        let x2 = this.head.coords.x2;
        let max = this.head.coords.width;
        let heigth = 0;

        while (curr.next !== null) {
            if (curr.coords.width > max) {
                max = curr.coords.width;
                x2 = curr.coords.x2;
            }

            heigth += curr.coords.height;
            curr = curr.next;
        }

        this.coords.width = max;
        this.coords.height = heigth;
        this.coords.x2 = x2;

        this.tail = curr;
    }

    /**
     *@param {DragableTopBottom} dragable
     @returns {boolean}
     * **/
    compare(dragable) {
        if (this.head === null) {
            return false;
        }

        let curr = this.head;
        const dragableTop = dragable.projectCoords("top");
        const dragableBottom = dragable.projectCoords("bottom");
        let currTop = curr.projectCoords("top");
        let currBottom = curr.projectCoords("bottom");
        while (curr != null) {
            if (isColidingOffset(dragableTop.x1, dragableTop.y2, currTop.x1, currTop.y2, ATTACH_OFFSET)) {

                return true;
            }
            if (isColidingOffset(currBottom.x1, currBottom.y2, dragableBottom.x1, dragableBottom.y2, ATTACH_OFFSET)) {
                return true;
            }
            curr = curr.next;
        }

        return false;
    }

    /**
     *@param {DragableTopBottom} parent
     *@param {DragableTopBottom} child
     * **/
    append(parent, child) {
        parent.next = child;
        child.prev = parent;
        if (this.tail === parent) {
            this.tail = child;
        }
        if (child.coords.width > this.coords.width) {
            this.coords.width = child.coords.width;
            this.coords.x2 = child.coords.x2;
        }
        this.coords.height += child.coords.height;
        this.coords.y2 = child.coords.y2;
    }

    /**
     *@param {DragableTopBottom} dragable
     * **/
    delete(dragable) {
        if (dragable.prev !== null) {
            dragable.prev.next = dragable.next;
        }
        if (dragable.next !== null) {
            dragable.next.prev = dragable.prev;
        }
        if (dragable === this.head) {
            if (dragable.next === null) {
                //! TODO delete
                removeElem(lists, this);
            }
            this.head = dragable.next;
        }

        this.coords.height -= dragable.coords.height;
        if (dragable.coords.width === this.coords.width) {
            this.updateWidth();
        }

        lists.push(new DragableTopBottomList(dragable));
    }

    updateWidth() {
        let curr = this.head.next;
        let x2 = this.head.coords.x2;
        let max = this.head.coords.width
        while (curr.next !== null) {
            if (curr.coords.width > max) {
                max = curr.coords.width;
            }

            curr = curr.next;
        }

        this.coords.width = max;
        this.coords.x2 = x2;
    }

}

export class DragableTopBottom {

    /**@type {HTMLDivElement | null}*/
    elem = null;

    /**@type {boolean}*/
    isLeaf = false;

    /**@type {Coordinates}*/
    coords = {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
        width: 0,
        height: 0,
    };

    /**
     *@constructor
     *@param {DragableType} type 
     *@param {number} componentType
     *@param {DragableTopBottom| null} prev
     *@param {DragableTopBottom| null} next
     *@param {string} color
     *@param {boolean} isBase
     *@param {boolean} firstTime
     */
    constructor(type, componentType, prev, next, color, isBase = false, firstTime = false) {
        this.type = type;
        this.componentType = componentType;
        this.prev = prev;
        this.next = next;
        this.color = color;
        this.isBase = isBase;
        this.isLeaf = false;
        this.firstTime = firstTime;
        this.coords = {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0,
            width: 50,
            height: 50,
        };

        this.init = this.init.bind(this);
        this.appendChild = this.appendChild.bind(this);
        this.removeChild = this.removeChild.bind(this);
        this.dragStart = this.dragStart.bind(this);
        this.dragMove = this.dragMove.bind(this);
        this.dragEnd = this.dragEnd.bind(this);

        const elem = document.createElement("div");
        elem.id = `${type}-${key++}`;
        elem.style.width = "50px";
        elem.style.height = "50px";
        elem.style.background = color;
        elem.style.position = "absolute";
        elem.style.zIndex = "0";
        elem.onpointerdown = this.dragStart;
        if (isBase) {
            containerDiv.appendChild(elem);
            elem.style.top = `${bases.length === 0 ? 10 : bases[bases.length - 1].elem.style.bottom.replace("px", "")}px`;
            elem.style.bottom = `${Number(elem.style.top.replace("px", "")) + elem.getBoundingClientRect().height}px`;
            bases.push(this);
        } else {
            elem.style.left = "0";
            elem.style.top = "0";
        }

        this.elem = elem;
    }

    /**
     *@param {DragableTopBottom} child 
    */
    appendChild(child) {
        if (this.isBase) {
            return;
        }
        child.prev = this;
        this.next = child;
        child.coords = {
            ...child.coords,
            x1: this.coords.x1,
            x2: this.coords.x1 + child.coords.width,
            y1: this.coords.y2,
            y2: this.coords.y2 + child.coords.height
        }
    }

    removeChild() {
        if (!this.next) return;
        this.next.prev = null;
        this.next = null;
        this.isLeaf = true;
        removeElem(parents, this);
        leaves.push(this);
    }

    removeElement() {
        /**@type {DragableTopBottom}*/
        let curr = this;

        while (curr.next !== null) {
            curr = curr.next;
        }

        while (curr !== this && curr !== null) {
            if (curr.isLeaf) {
                removeElem(leaves, curr);
            } else if (!curr.firstTime) {
                removeElem(parents, curr);
            }

            dropDiv.removeChild(curr.elem);
            curr.prev.next = null;
            curr = curr.prev;
        }
        if (this.isLeaf) {
            removeElem(leaves, this);
        } else if (!curr.firstTime) {
            removeElem(parents, this);
        }

        if (this.prev !== null) {
            this.prev.next = null;
            removeElem(parents, this.prev);
            leaves.push(this.prev);
        }

        dropDiv.removeChild(this.elem);
    }

    init() {
        if (!this.isBase) {
            return;
        }

        const rect = this.elem.getBoundingClientRect();
        const clone = new DragableTopBottom(this.type, this.componentType, null, null, this.color, false, true);
        dropDiv.appendChild(clone.elem);
        clone.coords.x1 = rect.x;
        clone.coords.y1 = rect.y;
        clone.elem.style.transform = `translate(${clone.coords.x1}px, ${clone.coords.y1}px)`;
        clone.dragStart();
    }

    /**
     *@param {"top" | "bottom"} dir 
     *@returns {Coordinates}
     * **/
    projectCoords(dir) {
        if (dir === "top") {
            return {
                x1: this.coords.x1,
                x2: this.coords.x2,
                y1: this.coords.y1 - this.coords.height,
                y2: this.coords.y1,
                height: this.coords.height,
                width: this.coords.width,
            }
        }

        return {
            x1: this.coords.x1,
            x2: this.coords.x2,
            y1: this.coords.y2,
            y2: this.coords.y2 + this.coords.height,
            height: this.coords.height,
            width: this.coords.width,
        }
    }

    dragStart() {
        if (this.isBase) {
            this.init();
            return;
        }
        if (handling) {
            return;
        }

        /**@type {DragableTopBottom}*/
        let curr = this;
        while (curr !== null) {
            curr.elem.style.zIndex = "1";
            curr = curr.next;
        }
        document.addEventListener("pointermove", this.dragMove);
        document.addEventListener("pointerup", this.dragEnd);
        handling = true;
    }

    /**
     *@param {number} x1 
     *@param {number} x2 
     *@param {number} y1 
     *@param {number} y2 
     @param {boolean} [transform=false] 
     * */
    adjustCoords(x1, x2, y1, y2, transform = false) {
        this.coords = {
            ...this.coords,
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
        }
        if (transform) {
            this.elem.style.transform = `translate(${x1}px, ${y1}px)`;
        }
        /**@type {DragableTopBottom}*/
        let parent = this;
        let curr = this.next;
        while (curr !== null) {
            if (transform) {
                curr.elem.style.transform = `translate(${parent.coords.x1}px, ${parent.coords.y2}px)`;
            }
            curr.coords = {
                ...curr.coords,
                x1: parent.coords.x1,
                x2: parent.coords.x1 + curr.coords.width,
                y1: parent.coords.y2,
                y2: parent.coords.y2 + curr.coords.height,
            }
            parent = curr;
            curr = curr.next;
        }
    }

    /**
    * @param {MouseEvent} event 
    */
    dragMove(event) {
        if (this.isBase) {
            return;
        }

        this.elem.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
        this.adjustCoords(event.clientX, event.clientX + this.coords.width,
            event.clientY, event.clientY + this.coords.height, true);
    }

    /**
    * @param {MouseEvent} event 
    */
    dragEnd(event) {
        handling = false;

        /**@type {DragableTopBottom}*/
        let curr = this;
        while (curr !== null) {
            curr.elem.style.zIndex = "0";
            curr = curr.next;
        }
        if (this.isBase) {
            return;
        }

        this.adjustCoords(event.clientX, event.clientX + this.coords.width,
            event.clientY, event.clientY + this.coords.height);

        if (!isSurrounding(this.coords, dropDivCoords)) {
            this.removeElement();
        } else {
            if (this.prev !== null) {
                if (!isColiding(this.coords, this.prev.coords)) {
                    this.prev.removeChild();
                } else {
                    this.adjustCoords(this.prev.coords.x1, this.prev.coords.x1 + this.coords.width,
                        this.prev.coords.y2, this.prev.coords.y2 + this.coords.height, true);

                    document.removeEventListener("pointermove", this.dragMove);
                    document.removeEventListener("pointerup", this.dragEnd);

                    return;
                }
            }

            let colloed = false;
            for (let i = 0; i < lists.length; i++) {
                const coords2 = lists[i].coords;
                if (isColiding(this.coords, coords2)) {
                    if (lists[i].compare(this)) {
                        colloed = true;
                        break;
                    }
                }
            }

            if (!colloed) {
                this.elem.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
                this.adjustCoords(event.clientX, event.clientX + this.coords.width,
                    event.clientY, event.clientY + this.coords.height, true);
            }

        }

        document.removeEventListener("pointermove", this.dragMove);
        document.removeEventListener("pointerup", this.dragEnd);
    }
}

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
