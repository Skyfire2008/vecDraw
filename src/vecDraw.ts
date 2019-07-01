class VecDraw {
	public templatePoint: ModelPoint;
	private pointHolder: HTMLElement;
	private mainCtx: CanvasRenderingContext2D;
	private gridCtx: CanvasRenderingContext2D;
	public gridWidth: number;
	public gridHeight: number;
	public readonly canvasPos: Point;

	private points: Map<number, ModelPoint>;
	private lines: Map<string, ModelLine>;
	private currentColor: string;

	constructor(pointTemplateElem: HTMLElement, pointHolder: HTMLElement, mainCtx: CanvasRenderingContext2D, gridCtx: CanvasRenderingContext2D, canvasPos: Point) {
		this.points = new Map();
		this.lines = new Map();
		this.currentColor = "#ffffff";
		this.pointHolder = pointHolder;
		this.canvasPos = canvasPos;
		this.templatePoint = new ModelPoint(0, 0, this, this.currentColor, pointTemplateElem);
		this.mainCtx = mainCtx;
		this.gridCtx = gridCtx;
	}

	/**
	 * Converts document position to model position
	 * @param pos			global position as point
	 */
	public globalToModelPos(pos: Point): Point {
		const x = Math.round((pos.x - this.canvasPos.x) / this.gridWidth);
		const y = Math.round((pos.y - this.canvasPos.y) / this.gridHeight);
		return new Point(x, y);
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
		if (to !== undefined && from !== undefined) {

			to.connectTo(from);
			from.connectTo(to);

			const line = new ModelLine(from, to);
			this.lines.set(line.id, line);

			this.drawLine(this.mainCtx, to, from);
		} else {
			throw `Either ${fromId} or ${toId} is an invalid point ID`;
		}
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
