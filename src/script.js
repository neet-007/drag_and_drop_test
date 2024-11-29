import { componentsArray, Dragable, init } from "./elemnts.js"

init();

const typeToColor = {
    "a": "blue",
    "b": "red",
    "c": "yellow",
    "d": "black",
}

/**@type {Dragable[]}*/
const bases = Array(componentsArray.length);
for (let i = 0; i < componentsArray.length; i++) {
    bases[i] = new Dragable("odd", componentsArray[i], null, null, typeToColor[componentsArray[i]], true);
}



