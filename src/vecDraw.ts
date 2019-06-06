var currentMode: Mode;

var xMouse = 0;
var yMouse = 0;

document.addEventListener("DOMContentLoaded", () => {

    const pointTemplate = document.getElementById("pointTemplate");
    const pointHolder = document.getElementById("pointHolder");

    currentMode = new AddPointMode(pointTemplate, pointHolder);

    console.log("hello world!");
});

document.addEventListener("keyup", (e: KeyboardEvent) => {
    console.log(e.key);
});

document.addEventListener("mousemove", (e: MouseEvent) => {
    currentMode.onMouseMove(e);
});

document.addEventListener("mouseup", (e: MouseEvent) => {
    currentMode.onMouseUp(e);
});

class ModelPoint {
    private point: Point;
    private color: string;
    private id: number;
    readonly elem: HTMLElement;

    private static count: number = 0;

    constructor(x: number, y: number, color: string, elem: HTMLElement) {
        this.point = new Point(x, y);
        this.color = color;
        this.id = ModelPoint.count++;
        this.elem = elem;
        this.resetElemPos();
    }

    public resetElemPos() {
        this.elem.setAttribute("style", `left: ${this.point.x - 10}; top: ${this.point.y - 10}`);
    }

    //GETTERS AND SETTERS
    get x(): number { return this.point.x; }
    set x(x: number) {
        this.point.x = x;
        this.resetElemPos();
    }

    get y(): number { return this.point.y; }
    set y(y: number) {
        this.point.y = y;
        this.resetElemPos();
    }
}

class VecDraw {
    private templatePoint: ModelPoint;
    private pointHolder: HTMLElement;

    private points: Array<ModelPoint>;
    private currentColor: string;

    public moveTemplatePoint(x: number, y: number) {
        this.templatePoint.x = x;
        this.templatePoint.y = y;
    }

    public addPoint() {
        const clone = <HTMLElement>this.templatePoint.elem.cloneNode(true);
        clone.removeAttribute("id");
        this.pointHolder.appendChild(clone);
        this.points.push(new ModelPoint(this.templatePoint.x, this.templatePoint.y, this.currentColor, clone));
    }
}
