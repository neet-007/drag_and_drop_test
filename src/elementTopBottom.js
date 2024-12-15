import { isColiding, isColidingOffset, isSurrounding } from "./collision.js";

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

const root = document.getElementById("root");

export const dropDiv = document.createElement("div");
dropDiv.id = "dropDiv";
dropDiv.style.width = "700px";
dropDiv.style.height = "1000px";
dropDiv.style.background = "gray";
dropDiv.style.border = "1px solid black";

/**@type {Coordinates}*/
export const dropDivCoords = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    height: 0,
    width: 0,
};

export const containerDiv = document.createElement("div");
containerDiv.id = "containerDiv";
containerDiv.style.width = "400px";
containerDiv.style.height = "1000px";
containerDiv.style.background = "white";
containerDiv.style.border = "1px solid black";

export function init() {
    root.appendChild(containerDiv);
    root.appendChild(dropDiv);
    const rect = dropDiv.getBoundingClientRect();
    dropDivCoords.x1 = rect.x
    dropDivCoords.x2 = rect.x + rect.width;
    dropDivCoords.y1 = rect.y
    dropDivCoords.y2 = rect.x + rect.height;
    dropDivCoords.height = rect.height;
    dropDivCoords.width = rect.width;
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
        let heigth = curr.coords.height;

        while (curr.next !== null) {
            if (curr.coords.width > max) {
                max = curr.coords.width;
                x2 = curr.coords.x2;
            }

            heigth += curr.coords.height;
            curr = curr.next;
        }

        this.coords = {
            ...this.head.coords,
            width: max,
            height: heigth,
            x2: x2,
        }

        this.tail = curr;
        this.head.list = this;
    }

    /**
     *@param {DragableTopBottom} dragable
     @returns {DragableTopBottom | null}
     * **/
    compare(dragable) {
        if (this.head === null) {
            return null;
        }

        let curr = this.head;
        /*
        const dragableTop = dragable.projectCoords("top");
        const dragableBottom = dragable.projectCoords("bottom");
        let currTop = curr.projectCoords("top");
        let currBottom = curr.projectCoords("bottom");
        */
        while (curr != null) {
            if (isColiding(dragable.coords, curr.coords)) {
                return curr;
            }
            /*
            if (isColidingOffset(currTop.x1, currTop.y2, dragableBottom.x1, dragableBottom.y2, ATTACH_OFFSET)) {
                return curr;
            }
            */
            curr = curr.next;
        }

        return null;
    }

    /**
     *@param {DragableTopBottom} parent 
     *@param {DragableTopBottom} child
     * **/
    attach(parent, child) {
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
        child.list = this;

    }

    /**
     *@param {DragableTopBottom} dragable
     *@param {boolean} [removeElemnt=false] 
     * **/
    delete(dragable, removeElemnt = false) {
        if (dragable.prev !== null) {
            console.log(dragable.prev);
            dragable.prev.next = dragable.next;
        }
        if (dragable.next !== null) {
            console.log(dragable.next);
            dragable.next.prev = dragable.prev;
        }
        if (dragable === this.head) {
            if (dragable.next === null) {
                //! TODO delete
                removeElem(lists, this);
                return;
            }
            this.head = dragable.next;
        }

        this.coords.height -= dragable.coords.height;
        if (dragable.coords.width === this.coords.width) {
            this.updateWidth();
        }

        if (removeElemnt) {
            //!TODO remove elemnt
            return;
        }
        lists.push(new DragableTopBottomList(dragable));
        dragable.list = lists[lists.length - 1];
    }

    updateWidth() {
        let curr = this.head;
        let x2 = this.head.coords.x2;
        let max = this.head.coords.width
        while (curr !== null) {
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

    /**@type {DragableTopBottomList | null}*/
    list = null;

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
        this.list = null;
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

        if (this.isBase) {
            return;
        }
        /**@type {DragableTopBottom}*/
        let curr = this;
        while (curr !== null) {
            curr.elem.style.zIndex = "0";
            curr = curr.next;
        }

        this.adjustCoords(event.clientX, event.clientX + this.coords.width,
            event.clientY, event.clientY + this.coords.height);

        if (!isSurrounding(this.coords, dropDivCoords)) {
            if (this.firstTime) {
                dropDiv.removeChild(this.elem)
            } else {
                this.list.delete(this, true);
            }
        } else {
            if (this.list !== null) {
                if (!isColiding(this.coords, this.list.coords)) {
                    this.list.delete(this, false);
                } else {
                    const comp = this.list.compare(this);
                    if (comp === null) {
                        throw new Error("this should not me null")
                    }

                    if (comp !== this) {
                        this.list.attach(this, comp);
                    }
                }
                document.removeEventListener("pointermove", this.dragMove);
                document.removeEventListener("pointerup", this.dragEnd);

                return;
            }

            this.firstTime = false;
            let collided = false;
            for (let i = 0; i < lists.length; i++) {
                const coords2 = lists[i].coords;
                if (isColiding(this.coords, coords2)) {
                    const comp = lists[i].compare(this)
                    if (comp !== null) {
                        collided = true;
                        lists[i].attach(comp, this);
                        console.log(lists[i]);
                        break;
                    }
                }
            }

            if (!collided) {
                this.elem.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
                this.adjustCoords(event.clientX, event.clientX + this.coords.width,
                    event.clientY, event.clientY + this.coords.height, true);
                lists.push(new DragableTopBottomList(this));
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
