class VecDraw {
    private templatePoint: ModelPoint;
    private pointHolder: HTMLElement;

    private points: Array<ModelPoint>;
    private currentColor: string;

    constructor(pointTemplateElem: HTMLElement, pointHolder: HTMLElement) {
        this.points = [];
        this.currentColor = "white";
        this.pointHolder = pointHolder;
        this.templatePoint = new ModelPoint(0, 0, this.currentColor, pointTemplateElem);
    }

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
