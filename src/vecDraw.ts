class VecDraw {
	private templatePoint: ModelPoint;
	private pointHolder: HTMLElement;

	//TODO: use map instead, so that can iterate without stumbling upon empty cells
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
		const current = new ModelPoint(this.templatePoint.x, this.templatePoint.y, this.currentColor, clone);
		this.points[current.id] = current;
		//this.points.push(new ModelPoint(this.templatePoint.x, this.templatePoint.y, this.currentColor, clone));
	}

	public pointAt(x: number, y: number): ModelPoint {
		let result: ModelPoint = null;

		for (const point of this.points) {
			let dx = point.x - x;
			let dy = point.y - y;
			if (dx * dx + dy * dy <= 100) {
				result = point;
				break;
			}
		}

		return result;
	}

	public movePoint(ind: number, x: number, y: number): void {
		this.points[ind].x = x;
		this.points[ind].y = y;
	}
}

class ModelPoint {
	private point: Point;
	private color: string;
	readonly id: number;
	readonly elem: HTMLElement;

	private static count: number = -1;

	constructor(x: number, y: number, color: string, elem: HTMLElement) {
		this.point = new Point(x, y);
		this.color = color;
		this.id = ModelPoint.count++;
		this.elem = elem;
		this.resetElemPos();
	}

	public resetElemPos() {
		//TODO: put 10, the radius, into a constant
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
