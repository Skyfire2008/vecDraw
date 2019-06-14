class VecDraw {
	private templatePoint: ModelPoint;
	private pointHolder: HTMLElement;
	private mainCtx: CanvasRenderingContext2D;
	private canvasLeft: number;
	private canvasTop: number;

	private points: Map<number, ModelPoint>;
	private lines: Map<string, ModelLine>;
	readonly currentColor: string;

	constructor(pointTemplateElem: HTMLElement, pointHolder: HTMLElement, mainCtx: CanvasRenderingContext2D, canvasLeft: number, canvasTop: number) {
		this.points = new Map();
		this.lines = new Map();
		this.currentColor = "white";
		this.pointHolder = pointHolder;
		this.templatePoint = new ModelPoint(0, 0, this.currentColor, pointTemplateElem);
		this.mainCtx = mainCtx;
		this.canvasLeft = canvasLeft;
		this.canvasTop = canvasTop;
	}

	private redrawLines() {
		this.mainCtx.clearRect(0, 0, 800, 600);
		for (const line of this.lines.values()) {
			//const from = this.points.get(line.from.id);
			//const to = this.points.get(line.to.id);

			const startPos = new Point(line.from.x - this.canvasLeft, line.from.y - this.canvasTop);
			const endPos = new Point(line.to.x - this.canvasLeft, line.to.y - this.canvasTop);

			const grad = this.mainCtx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
			grad.addColorStop(0, line.from.color);
			grad.addColorStop(1, line.to.color);
			this.mainCtx.strokeStyle = grad;

			this.mainCtx.beginPath();
			this.mainCtx.moveTo(line.from.x - this.canvasLeft, line.from.y - this.canvasTop);
			this.mainCtx.lineTo(line.to.x - this.canvasLeft, line.to.y - this.canvasTop);
			this.mainCtx.stroke();
		}
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

	public addLine(fromId: number, toId: number) {
		let to = this.points.get(toId);
		let from = this.points.get(fromId);
		if (to !== undefined && from !== undefined) {
			const line = new ModelLine(from, to);
			this.lines.set(line.id, line);

			//TODO: add a function to draw a single line
			const startPos = new Point(line.from.x - this.canvasLeft, line.from.y - this.canvasTop);
			const endPos = new Point(line.to.x - this.canvasLeft, line.to.y - this.canvasTop);

			const grad = this.mainCtx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
			grad.addColorStop(0, line.from.color);
			grad.addColorStop(1, line.to.color);
			this.mainCtx.strokeStyle = grad;

			this.mainCtx.beginPath();
			this.mainCtx.moveTo(line.from.x - this.canvasLeft, line.from.y - this.canvasTop);
			this.mainCtx.lineTo(line.to.x - this.canvasLeft, line.to.y - this.canvasTop);
			this.mainCtx.stroke();
		} else {
			throw `Either ${fromId} or ${toId} is an invalid point ID`;
		}
	}

	public pointAt(x: number, y: number): ModelPoint {
		let result: ModelPoint = null;

		for (const point of this.points.values()) {
			if (point.containsPoint(x, y)) {
				result = point;
				break;
			}
		}

		return result;
	}

	public movePoint(id: number, x: number, y: number): void {
		this.points.get(id).x = x;
		this.points.get(id).y = y;
		this.redrawLines();
	}
}

class ModelLine {
	readonly from: ModelPoint;
	readonly to: ModelPoint;
	readonly id: string;

	public static makeId(fromId: number, toId: number): string {
		//line goes from lower to higher id point
		if (toId < fromId) {
			let temp = fromId;
			fromId = toId;
			toId = temp;
		}

		return `${fromId}->${toId}`;
	}

	constructor(from: ModelPoint, to: ModelPoint) {
		if (to.id < from.id) {
			let temp = from;
			from = to;
			to = temp;
		}

		this.from = from;
		this.to = to;
		//TODO: eliminate double swap of to and from
		this.id = ModelLine.makeId(from.id, to.id);
	}
}

class ModelPoint {

	static readonly radius = 10;
	static readonly radius2 = ModelPoint.radius * ModelPoint.radius;
	private static count: number = -1;

	private point: Point;
	private connections: Array<ModelPoint>;
	readonly color: string;
	readonly id: number;
	readonly elem: HTMLElement;

	constructor(x: number, y: number, color: string, elem: HTMLElement) {
		this.point = new Point(x, y);
		this.connections = [];

		//TODO: purely for testing, remove me
		//this.color = color;
		const r = Math.floor(Math.random() * 256);
		const g = Math.floor(Math.random() * 256);
		const b = Math.floor(Math.random() * 256);
		this.color = "#" + r.toString(16) + g.toString(16) + b.toString(16);

		this.id = ModelPoint.count++;
		this.elem = elem;
		this.resetElemPos();
	}

	public containsPoint(x: number, y: number): boolean {
		let dx = this.x - x;
		let dy = this.y - y;
		return dx * dx + dy * dy < ModelPoint.radius2;
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
