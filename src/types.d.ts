export { };

declare global {
    type DragableType = "odd" | "even";

    type Coordinates = {
        x1: number;
        x2: number;
        y1: number;
        y2: number;
        width: number;
        height: number;
    }
}
