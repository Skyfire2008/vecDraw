class VecDraw {
	private templatePoint: ModelPoint;
	private pointHolder: HTMLElement;
	private mainCtx: CanvasRenderingContext2D;
	private gridCtx: CanvasRenderingContext2D;
	public gridWidth: number;
	public gridHeight: number;
	public canvasLeft: number;
	public canvasTop: number;

	private points: Map<number, ModelPoint>;
	private lines: Map<string, ModelLine>;
	private currentColor: string;

	constructor(pointTemplateElem: HTMLElement, pointHolder: HTMLElement, mainCtx: CanvasRenderingContext2D, gridCtx: CanvasRenderingContext2D, canvasLeft: number, canvasTop: number) {
		this.points = new Map();
		this.lines = new Map();
		this.currentColor = "#ffffff";
		this.pointHolder = pointHolder;
		this.templatePoint = new ModelPoint(new Point(0, 0), this, this.currentColor, pointTemplateElem);
		this.mainCtx = mainCtx;
		this.gridCtx = gridCtx;
		this.canvasLeft = canvasLeft;
		this.canvasTop = canvasTop;
	}

	public getGridPos(pos: Point): Point {

		const canvasPos = new Point(this.canvasLeft, this.canvasTop);

		pos = pos.sub(canvasPos);
		pos.x = Math.round(pos.x / this.gridWidth)/* * this.gridWidth*/;
		pos.y = Math.round(pos.y / this.gridHeight)/* * this.gridHeight*/;

		return pos/*.add(canvasPos)*/;
	}

	public redrawGrid() {
		this.gridCtx.clearRect(0, 0, 800, 600);
		this.gridCtx.strokeStyle = "#ff8800";

		let x = 400;
		this.gridCtx.beginPath();
		while (x <= 800) {
			let foo = Math.floor(x) + 0.5;
			this.gridCtx.moveTo(foo, 0);
			this.gridCtx.lineTo(foo, 600);
			x += this.gridWidth;
		}

		x = 400;
		while (x >= 0) {
			let foo = Math.floor(x) + 0.5;
			this.gridCtx.moveTo(foo, 0);
			this.gridCtx.lineTo(foo, 600);
			x -= this.gridWidth;
		}

		let y = 300;
		while (y <= 600) {
			let foo = Math.floor(y) + 0.5;
			this.gridCtx.moveTo(0, foo);
			this.gridCtx.lineTo(800, foo);
			y += this.gridHeight;
		}

		y = 300;
		while (y >= 0) {
			let foo = Math.floor(y) + 0.5;
			this.gridCtx.moveTo(0, foo);
			this.gridCtx.lineTo(800, foo);
			y -= this.gridHeight;
		}
		this.gridCtx.stroke();
	}

	public resetTemplatePoint() {
		this.moveTemplatePoint(new Point(-100, -100));
	}

	public setCurrentColor(color: string) {
		this.currentColor = color;
	}

	public redrawLines() {
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

	public moveTemplatePoint(pos: Point) {
		this.templatePoint.gridPos = this.getGridPos(pos);
		this.templatePoint.resetElemPos();
	}

	public addPoint(): ModelPoint {
		const clone = <HTMLElement>this.templatePoint.elem.cloneNode(true);
		clone.removeAttribute("id");
		this.pointHolder.appendChild(clone);
		const current = new ModelPoint(this.templatePoint.gridPos, this, this.currentColor, clone);
		this.points.set(current.id, current);
		return current;
		//this.points.push(new ModelPoint(this.templatePoint.x, this.templatePoint.y, this.currentColor, clone));
	}

	public removeLine(from: ModelPoint, to: ModelPoint): boolean {
		return false;
	}

	public addLine(fromId: number, toId: number) {
		let to = this.points.get(toId);
		let from = this.points.get(fromId);
		if (to !== undefined && from !== undefined) {

			to.connectTo(fromId);
			from.connectTo(toId);

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

	public setPointColor(id: number, color: string) {
		this.points.get(id).color = color;
	}

	public pointAt(pos: Point): number {
		let result = -1;

		for (const point of this.points.values()) {
			if (point.containsPoint(pos)) {
				result = point.id;
				break;
			}
		}

		return result;
	}

	public movePoint(id: number, pos: Point): void {
		this.points.get(id).gridPos = this.getGridPos(pos);
		this.points.get(id).resetElemPos();
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
