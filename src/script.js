import { DragableTopBottom, init, componentsArray } from "./elementTopBottom.js";

init();

const typeToColor = {
    0: "blue",
    1: "red",
    2: "yellow",
    3: "black",
}

/**@type {DragableTopBottom[]}*/
const bases = Array(componentsArray.length);
for (let i = 0; i < componentsArray.length; i++) {
    bases[i] = new DragableTopBottom("odd", componentsArray[i], null, null, typeToColor[componentsArray[i]], true);
}



