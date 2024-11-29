import { isColiding, isSurrounding } from "./collision.js";

const root = document.getElementById("root");

export const dropDiv = document.createElement("div");
dropDiv.id = "dropDiv";
dropDiv.style.width = "700px";
dropDiv.style.height = "1000px";
dropDiv.style.background = "gray";
dropDiv.style.border = "1px solid black";

/**@type {Coordinates}*/
let dropDivCoords = {
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
    dropDivCoords = {
        x1: rect.x,
        x2: rect.x + rect.width,
        y1: rect.y,
        y2: rect.y + rect.height,
        height: rect.height,
        width: rect.width,
    };
}

/**@type {Dragable[]}*/
export const bases = [];

/**@type {Dragable[]}*/
export const parents = [];

/**@type {Dragable[]}*/
export const leaves = [];

//! TODO find a better way to handle not adding  event listener to the parent thet the child is attaching to
let handling = false;
let key = 0;
export class Dragable {

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
     *@param {Dragable| null} prev
     *@param {Dragable| null} next
     *@param {string} color
     *@param {boolean} isBase
     *@param {boolean} firstTime
     */
    constructor(type, prev, next, color, isBase = false, firstTime = false) {
        this.type = type;
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
     *@param {Dragable} child 
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
        //console.log(this)
        if (!this.next) return;
        this.next.prev = null;
        this.next = null;
        removeElem(parents, this);
    }

    removeElement() {
        if (this.prev) {
            this.prev.removeChild();
        }
        dropDiv.removeChild(this.elem);
        if (this.isLeaf) {
            removeElem(leaves, this);
        } else if (!this.firstTime) {
            removeElem(parents, this);
        }
    }

    init() {
        if (!this.isBase) {
            return;
        }

        const rect = this.elem.getBoundingClientRect();
        const clone = new Dragable(this.type, null, null, this.color, false, true);
        dropDiv.appendChild(clone.elem);
        clone.coords.x1 = rect.x;
        clone.coords.y1 = rect.y;
        clone.elem.style.transform = `translate(${clone.coords.x1}px, ${clone.coords.y1}px)`;
        clone.dragStart();
    }

    dragStart() {
        if (this.isBase) {
            this.init();
            return;
        }
        if (handling) {
            return;
        }

        document.addEventListener("pointermove", this.dragMove);
        document.addEventListener("pointerup", this.dragEnd);
        handling = true;
    }

    /**
    * @param {MouseEvent} event 
    */
    dragMove(event) {
        if (this.isBase) {
            return;
        }

        this.elem.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
        this.coords = {
            ...this.coords,
            x1: event.clientX,
            x2: event.clientX + this.coords.width,
            y1: event.clientY,
            y2: event.clientY + this.coords.height,
        }
        /**@type {Dragable}*/
        let parent = this;
        let curr = this.next;
        while (curr !== null) {
            console.log(parent.coords)
            curr.elem.style.transform = `translate(${parent.coords.x1}px, ${parent.coords.y2}px)`;
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
    dragEnd(event) {
        handling = false;

        this.coords = {
            ...this.coords,
            x1: event.clientX,
            x2: event.clientX + this.coords.width,
            y1: event.clientY,
            y2: event.clientY + this.coords.height,
        }

        /**@type {Dragable}*/
        let parent = this;
        let curr = this.next;
        while (curr !== null) {
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

        if (this.isBase) {
            return;
        }

        if (!isSurrounding(this.coords, dropDivCoords)) {
            let curr = this.next;
            while (curr !== null) {
                curr.removeElement();
                curr = curr.next;
            }
            this.removeElement();
        } else {
            if (this.prev !== null) {
                if (!isColiding(this.coords, this.prev.coords)) {
                    this.prev.removeChild();
                } else {
                    this.elem.style.transform = `translate(${this.prev.coords.x1}px, ${this.prev.coords.y2}px)`;
                }
            }
            else {
                let colloed = false;
                for (let i = 0; i < leaves.length; i++) {
                    if (this === leaves[i] || this.next === leaves[i]) {
                        continue;
                    }
                    const coords2 = leaves[i].coords;
                    if (isColiding(this.coords, coords2)) {
                        leaves[i].appendChild(this);
                        this.elem.style.transform = `translate(${leaves[i].coords.x1}px, ${leaves[i].coords.y2}px)`;
                        parents.push(leaves[i]);
                        leaves[i].isLeaf = false;
                        leaves.splice(i, 1);
                        colloed = true;
                        break;
                    } else {
                        console.log("elem", this.coords);
                        console.log("failed with", coords2);
                    }
                }

                if (!colloed) {
                    this.elem.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
                }

                if (!this.isLeaf && this.next === null) {
                    leaves.push(this);
                    this.isLeaf = true;
                }

                if (this.firstTime) {
                    this.firstTime = false;
                    this.isLeaf = true;
                }
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
