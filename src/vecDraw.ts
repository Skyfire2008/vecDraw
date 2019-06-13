class VecDraw {
	private templatePoint: ModelPoint;
	private pointHolder: HTMLElement;

	private points: Map<number, ModelPoint>;
	private lines: Map<string, ModelLine>;
	private currentColor: string;

	constructor(pointTemplateElem: HTMLElement, pointHolder: HTMLElement) {
		this.points = new Map();
		this.lines = new Map();
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
		this.points.set(current.id, current);
		//this.points.push(new ModelPoint(this.templatePoint.x, this.templatePoint.y, this.currentColor, clone));
	}

	public pointAt(x: number, y: number): ModelPoint {
		let result: ModelPoint = null;

		for (const point of this.points.values()) {
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
		this.points.get(ind).x = x;
		this.points.get(ind).y = y;
	}
}

class ModelLine {
	private from: ModelPoint;
	private to: ModelPoint;
	readonly id: string;

	public static makeId(fromId: number, toId: number): string {
		//line goes from lower to higher id point
		if (toId < fromId) {
			let temp = fromId;
			fromId = toId;
			toId = fromId;
		}

		return `${fromId}->${toId}`;
	}

	constructor(from: ModelPoint, to: ModelPoint) {
		this.from = from;
		this.to = to;
		this.id = ModelLine.makeId(from.id, to.id);
	}
}

class ModelPoint {
	private point: Point;
	private connections: Array<ModelPoint>;
	private color: string;
	readonly id: number;
	readonly elem: HTMLElement;

	private static count: number = -1;

	constructor(x: number, y: number, color: string, elem: HTMLElement) {
		this.point = new Point(x, y);
		this.connections = [];
		this.color = color;
		this.id = ModelPoint.count++;
		this.elem = elem;
		this.resetElemPos();
	}

	public connectTo(other: ModelPoint) {
		if (other.id < this.id) {
			other.connectTo(this);
		} else {
			this.connections.push(other);
		}
	}

	public resetElemPos() {
		//TODO: put 10, the radius, into a constant
		this.elem.setAttribute("style", `left: ${this.point.x - 10}px; top: ${this.point.y - 10}px`);
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
