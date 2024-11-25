import { isColiding, isSurrounding } from "./collision.js";

export const dropDiv = document.createElement("div");
dropDiv.id = "dropDiv";
dropDiv.style.position = "absolute";
dropDiv.style.left = "400px";
dropDiv.style.width = "700px";
dropDiv.style.height = "1000px";
dropDiv.style.background = "gray";
dropDiv.style.border = "1px solid black";

const dropDivRect = dropDiv.getBoundingClientRect();


export const containerDiv = document.createElement("div");
containerDiv.id = "containerDiv";
containerDiv.style.position = "absolute";
containerDiv.style.left = "0px";
containerDiv.style.width = "400px";
containerDiv.style.height = "1000px";
containerDiv.style.background = "white";
containerDiv.style.border = "1px solid black";


export function init() {
    document.body.appendChild(dropDiv);
    document.body.appendChild(containerDiv);
}

/**@type {Dragable[]}*/
export const parents = [];

/**@type {Dragable[]}*/
export const leaves = [];

let key = 0;
export class Dragable {

    /**@type {HTMLDivElement | null}*/
    elem = null;

    /**
     *@constructor
     *@param {DragableType} type 
     *@param {Dragable| null} prev
     *@param {Dragable| null} next
     *@param {string} color
     *@param {boolean} isBase
     */
    constructor(type, prev, next, color, isBase = false) {
        this.type = type;
        this.prev = prev;
        this.next = next;
        this.color = color;
        this.isBase = isBase;

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
            elem.style.top = `${parents.length === 0 ? 10 : parents[parents.length - 1].elem.getBoundingClientRect().bottom}`;
            parents.push(this);
        } else if (prev === null) {
            dropDiv.appendChild(elem);
        } else {
            prev.elem.appendChild(elem);
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
    }

    removeChild() {
        this.next.prev = null;
        this.elem.removeChild(this.next.elem);
        this.next = null;
    }

    init() {
        console.log("then here");
        if (!this.isBase) {
            return;
        }

        const clone = new Dragable(this.type, null, null, this.color);
        document.addEventListener("pointermove", clone.dragMove);
        document.addEventListener("pointerup", clone.dragEnd);

    }

    dragStart() {
        if (this.isBase) {
            this.init();
            return;
        }
        document.addEventListener("pointermove", this.dragMove);
        document.addEventListener("pointerup", this.dragEnd);
    }

    /**
    * @param {MouseEvent} event 
    */
    dragMove(event) {
        console.log("here", this.isBase);
        if (this.isBase) {
            return;
        }

        let rect = this.elem.getBoundingClientRect();
        let parentRect = this.elem.getBoundingClientRect();
        this.elem.style.left = `${event.clientX - rect.width / 2}px`;
        this.elem.style.top = `${event.clientY - rect.height / 2}px`;

        let mult = 0;
        let curr = this.next;
        while (curr !== null) {
            rect = curr.elem.getBoundingClientRect();
            this.elem.style.left = `${event.clientX - rect.width / 2}px`;
            this.elem.style.top = `${event.clientY - rect.height / 2 + mult * parentRect.height}px`;
            curr = curr.next;
            parentRect = rect;
        }
    }

    dragEnd() {
        if (this.isBase) {
            return;
        }

        const rect = this.elem.getBoundingClientRect();
        if (!isSurrounding(rect, dropDivRect)) {
            if (this.prev) {
                this.prev.elem.removeChild(this.elem);
            } else if (parents.includes(this)) {
                dropDiv.removeChild(this.elem);
            } else {
                containerDiv.removeChild(this.elem);
            }
        } else {
            for (let i = 0; i < leaves.length; i++) {
                const rect2 = leaves[i].elem.getBoundingClientRect();
                if (isColiding(rect, rect2)) {
                    leaves[i].appendChild(this);
                    this.elem.style.top = `${rect2.bottom}px`;
                    this.elem.style.left = `${rect2.left}px`;
                    break;
                }
            }
            if (this.prev !== null) {
                this.prev.removeChild();
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
