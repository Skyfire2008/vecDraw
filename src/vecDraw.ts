class VecDraw {
	private templatePoint: ModelPoint;
	private pointHolder: HTMLElement;
	private mainCtx: CanvasRenderingContext2D;
	private gridCtx: CanvasRenderingContext2D;
	public gridWidth: number;
	public gridHeight: number;
	private canvasPos: Point;

	private points: Map<number, ModelPoint>;
	private lines: Map<string, ModelLine>;
	private currentColor: string;

	constructor(pointTemplateElem: HTMLElement, pointHolder: HTMLElement, mainCtx: CanvasRenderingContext2D, gridCtx: CanvasRenderingContext2D, canvasPos: Point) {
		this.points = new Map();
		this.lines = new Map();
		this.currentColor = "white";
		this.pointHolder = pointHolder;
		this.templatePoint = new ModelPoint(0, 0, this, this.currentColor, pointTemplateElem);
		this.mainCtx = mainCtx;
		this.gridCtx = gridCtx;
		this.canvasPos = canvasPos;
	}

	public attachToGrid(pos: Point): Point {

		pos = pos.sub(this.canvasPos);
		pos.x = Math.round(pos.x / this.gridWidth) * this.gridWidth;
		pos.y = Math.round(pos.y / this.gridHeight) * this.gridHeight;

		return pos.add(this.canvasPos);
	}

	/*public drawLine(ctx: CanvasRenderingContext2D, from: ModelPoint, to: ModelPoint) {
		const grad = this.mainCtx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
		grad.addColorStop(0, from.color);
		grad.addColorStop(1, to.color);
		this.mainCtx.strokeStyle = grad;

		this.mainCtx.beginPath();
		this.mainCtx.moveTo(line.from.x - this.canvasPos.x, line.from.y - this.canvasPos.y);
		this.mainCtx.lineTo(line.to.x - this.canvasPos.x, line.to.y - this.canvasPos.y);
		this.mainCtx.stroke();
	}*/

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
		this.moveTemplatePoint(-100, -100);
	}

	public setCurrentColor(color: string) {
		this.currentColor = color;
	}

	public redrawLines() {
		this.mainCtx.clearRect(0, 0, 800, 600);
		for (const line of this.lines.values()) {
			//const from = this.points.get(line.from.id);
			//const to = this.points.get(line.to.id);

			const startPos = new Point(line.from.x - this.canvasPos.x, line.from.y - this.canvasPos.y);
			const endPos = new Point(line.to.x - this.canvasPos.x, line.to.y - this.canvasPos.y);

			const grad = this.mainCtx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
			grad.addColorStop(0, line.from.color);
			grad.addColorStop(1, line.to.color);
			this.mainCtx.strokeStyle = grad;

			this.mainCtx.beginPath();
			this.mainCtx.moveTo(line.from.x - this.canvasPos.x, line.from.y - this.canvasPos.y);
			this.mainCtx.lineTo(line.to.x - this.canvasPos.x, line.to.y - this.canvasPos.y);
			this.mainCtx.stroke();
		}
	}

	public moveTemplatePoint(x: number, y: number) {
		const pos = new Point(x, y);
		this.templatePoint.pos = this.attachToGrid(pos);
		this.templatePoint.resetElemPos();
	}

	public addPoint(): ModelPoint {
		const clone = <HTMLElement>this.templatePoint.elem.cloneNode(true);
		clone.removeAttribute("id");
		this.pointHolder.appendChild(clone);
		const current = new ModelPoint(this.templatePoint.x, this.templatePoint.y, this, this.currentColor, clone);
		this.points.set(current.id, current);
		return current;
		//this.points.push(new ModelPoint(this.templatePoint.x, this.templatePoint.y, this.currentColor, clone));
	}

	public addLine(fromId: number, toId: number) {
		let to = this.points.get(toId);
		let from = this.points.get(fromId);
		if (to !== undefined && from !== undefined) {

			to.connectTo(from);
			from.connectTo(to);

			const line = new ModelLine(from, to);
			this.lines.set(line.id, line);

			//TODO: add a function to draw a single line
			const startPos = new Point(line.from.x - this.canvasPos.x, line.from.y - this.canvasPos.y);
			const endPos = new Point(line.to.x - this.canvasPos.x, line.to.y - this.canvasPos.y);

			const grad = this.mainCtx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
			grad.addColorStop(0, line.from.color);
			grad.addColorStop(1, line.to.color);
			this.mainCtx.strokeStyle = grad;

			this.mainCtx.beginPath();
			this.mainCtx.moveTo(line.from.x - this.canvasPos.x, line.from.y - this.canvasPos.y);
			this.mainCtx.lineTo(line.to.x - this.canvasPos.x, line.to.y - this.canvasPos.y);
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
		const pos = new Point(x, y);
		this.points.get(id).pos = this.attachToGrid(pos);
		this.points.get(id).resetElemPos();
		this.redrawLines();
	}
}
