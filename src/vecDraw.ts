class VecDraw {
	public templatePoint: ModelPoint;
	private pointHolder: HTMLElement;
	private mainCtx: CanvasRenderingContext2D;
	private gridCtx: CanvasRenderingContext2D;
	public gridWidth: number;
	public gridHeight: number;
	public center: Point;
	public readonly canvasPos: Point;
	public readonly canvasSize: Point;

	private points: Map<number, ModelPoint>;
	private lines: Map<string, ModelLine>;
	private currentColor: string;

	constructor(pointTemplateElem: HTMLElement, pointHolder: HTMLElement, mainCtx: CanvasRenderingContext2D, gridCtx: CanvasRenderingContext2D, canvasSize: Point, canvasPos: Point, gridSize: Point) {
		this.points = new Map();
		this.lines = new Map();
		this.currentColor = "#ffffff";
		this.pointHolder = pointHolder;
		this.canvasPos = canvasPos;
		this.canvasSize = canvasSize;
		this.mainCtx = mainCtx;
		this.gridCtx = gridCtx;

		this.gridWidth = gridSize.x;
		this.gridHeight = gridSize.y;

		this.center = new Point(Math.round(canvasSize.x / (2 * this.gridWidth)), Math.round(canvasSize.y / (2 * this.gridHeight)));
		this.templatePoint = new ModelPoint(0, 0, this, this.currentColor, pointTemplateElem);
	}

	public toString(): string {
		let pointMap: Map<number, number> = new Map<number, number>();

		let pointStr = "";
		let lineStr = "";

		let i = 0;
		for (const entry of this.points) {
			pointStr += `    {"x": ${entry[1].x}, "y": ${entry[1].y}, "color": "${entry[1].color}"},\n`;
			pointMap.set(entry[0], i);
			i++;
		}
		pointStr = pointStr.substring(0, pointStr.length - 2) + "\n";

		for (const entry of this.lines) {
			lineStr += `    {"from": ${pointMap.get(entry[1].from.id)}, "to": ${pointMap.get(entry[1].to.id)}},\n`;
		}
		lineStr = lineStr.substring(0, lineStr.length - 2) + "\n";

		//no JSON.stringify is used to enforce custom formatting
		return `{\n  "points": [\n${pointStr}  ],"lines": [\n${lineStr}]}`;
	}

	/**
	 * Converts document position to model position
	 * @param pos			global position as point
	 */
	public globalToModelPos(pos: Point): Point {
		const x = Math.round((pos.x - this.canvasPos.x) / this.gridWidth);
		const y = Math.round((pos.y - this.canvasPos.y) / this.gridHeight);
		return new Point(x, y).sub(this.center);
	}

	public drawLine(ctx: CanvasRenderingContext2D, from: ModelPoint, to: ModelPoint) {
		const grad = ctx.createLinearGradient(from.canvasPos.x, from.canvasPos.y, to.canvasPos.x, to.canvasPos.y);
		grad.addColorStop(0, from.color);
		grad.addColorStop(1, to.color);
		ctx.strokeStyle = grad;

		ctx.beginPath();
		ctx.moveTo(from.canvasPos.x, from.canvasPos.y);
		ctx.lineTo(to.canvasPos.x, to.canvasPos.y);
		ctx.stroke();
	}

	public redrawGrid() {
		this.gridCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
		this.gridCtx.strokeStyle = "#ff8800";

		let x = 0;
		this.gridCtx.beginPath();
		while (x <= this.canvasSize.x) {
			let foo = Math.floor(x) + 0.5;
			this.gridCtx.moveTo(foo, 0);
			this.gridCtx.lineTo(foo, this.canvasSize.y);
			x += this.gridWidth;
		}

		let y = 0;
		while (y <= this.canvasSize.y) {
			let foo = Math.floor(y) + 0.5;
			this.gridCtx.moveTo(0, foo);
			this.gridCtx.lineTo(this.canvasSize.x, foo);
			y += this.gridHeight;
		}

		this.gridCtx.closePath();
		this.gridCtx.stroke();

		this.gridCtx.lineWidth = 2;
		this.gridCtx.strokeStyle = "#ffff00";
		this.gridCtx.beginPath();

		let foo = this.center.x * this.gridWidth;
		let bar = this.center.y * this.gridHeight;
		this.gridCtx.moveTo(foo, 0);
		this.gridCtx.lineTo(foo, this.canvasSize.y);
		this.gridCtx.moveTo(0, bar);
		this.gridCtx.lineTo(this.canvasSize.x, bar);

		this.gridCtx.closePath();
		this.gridCtx.stroke();
	}

	public resetTemplatePoint() {
		this.moveTemplatePoint(-100, -100);
	}

	public setCurrentColor(color: string) {
		this.currentColor = color;
		this.templatePoint.color = color;
	}

	public getCurrentColor(): string {
		return this.currentColor;
	}

	public redrawLines() {
		this.mainCtx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
		for (const line of this.lines.values()) {
			this.drawLine(this.mainCtx, line.from, line.to);
		}
	}

	public moveTemplatePoint(x: number, y: number) {
		const pos = new Point(x, y);
		this.templatePoint.pos = this.globalToModelPos(pos);
		this.templatePoint.resetElemPos();
	}

	public addPoint(): ModelPoint {
		const clone = <HTMLElement>this.templatePoint.elem.cloneNode(true);
		clone.removeAttribute("id");
		this.pointHolder.appendChild(clone);
		const current = new ModelPoint(this.templatePoint.x, this.templatePoint.y, this, this.currentColor, clone);
		this.points.set(current.id, current);
		return current;
	}

	public removeLine(fromId: number, toId: number) {
		const lineId = ModelLine.makeId(fromId, toId);
		if (this.lines.has(lineId)) {
			this.lines.delete(lineId);
			this.points.get(fromId).disconnectFrom(this.points.get(toId));
			this.redrawLines();
		}

	}

	public removePoint(pointId: number) {
		const point = this.points.get(pointId);
		let pointHadConnections = false;
		if (point !== undefined) {
			pointHadConnections = point.hasConnections();
			for (const toId of point.getConnections()) {
				point.disconnectFrom(this.points.get(toId));
				this.lines.delete(ModelLine.makeId(point.id, toId));
			}
		}

		this.points.delete(point.id);
		point.elem.remove();
		if (pointHadConnections) {
			this.redrawLines();
		}
	}

	public addLine(fromId: number, toId: number) {
		let to = this.points.get(toId);
		let from = this.points.get(fromId);
		if (to !== undefined && from !== undefined && to.id !== from.id) {

			to.connectTo(from);
			from.connectTo(to);

			const line = new ModelLine(from, to);
			this.lines.set(line.id, line);

			this.drawLine(this.mainCtx, to, from);
		}
	}

	public pointsInRect(rect: DOMRect): Array<ModelPoint> {
		let result: Array<ModelPoint> = [];
		rect.x -= ModelPoint.radius;
		rect.y -= ModelPoint.radius;
		rect.width += 2 * ModelPoint.radius;
		rect.height += 2 * ModelPoint.radius;

		for (const point of this.points.values()) {
			const globalPos = point.globalPos;
			if (globalPos.x > rect.x && globalPos.x <= rect.right && globalPos.y > rect.y && globalPos.y <= rect.bottom) {
				result.push(point);
			}
		}

		return result;
	}

	public pointAt(x: number, y: number): ModelPoint {
		let result: ModelPoint = null;
		const globalPos = new Point(x, y);

		for (const point of this.points.values()) {
			if (point.globalPos.distance(globalPos) < ModelPoint.radius) {
				result = point;
				break;
			}
		}

		return result;
	}
}
