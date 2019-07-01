interface Mode {
	onEnable(): void;
	onDisable(): void;
	onMouseMove(e: MouseEvent): void;
	onMouseDown(e: MouseEvent): void;
	onMouseUp(e: MouseEvent): void;
}

abstract class AbstractMode implements Mode {

	protected owner: VecDraw;

	constructor(vecDraw: VecDraw) {
		this.owner = vecDraw;
	}

	abstract onEnable(): void;
	abstract onDisable(): void;
	abstract onMouseMove(e: MouseEvent): void;
	abstract onMouseDown(e: MouseEvent): void;
	abstract onMouseUp(e: MouseEvent): void;
}

class AddConnectedPointMode extends AbstractMode {
	private prevPoint: ModelPoint;
	private tempCtx: CanvasRenderingContext2D;
	private canvasLeft: number;
	private canvasTop: number;

	constructor(vecDraw: VecDraw, tempCtx: CanvasRenderingContext2D, canvasLeft: number, canvasTop: number) {
		super(vecDraw);
		this.prevPoint = null;
		this.tempCtx = tempCtx;
		this.canvasLeft = canvasLeft;
		this.canvasTop = canvasTop;
	}

	onEnable(): void { }
	onDisable(): void {
		this.prevPoint = null;
		this.tempCtx.clearRect(0, 0, 800, 600);
		this.owner.resetTemplatePoint();
	}

	onMouseMove(e: MouseEvent): void {
		this.owner.moveTemplatePoint(e.x, e.y);
		if (this.prevPoint !== null) {
			this.tempCtx.clearRect(0, 0, 800, 600);
			this.owner.drawLine(this.tempCtx, this.prevPoint, this.owner.templatePoint);
		}
	}

	onMouseUp(e: MouseEvent): void {
		const newPoint = this.owner.addPoint();
		if (this.prevPoint !== null) {
			this.owner.addLine(this.prevPoint.id, newPoint.id);
		}

		this.prevPoint = newPoint;
	}

	onMouseDown(e: MouseEvent): void {
		const foo = this.owner.pointAt(e.x, e.y);
		if (foo !== null) {
			this.prevPoint = foo;
			this.owner.setCurrentColor(this.prevPoint.color);
		}
	}
}

class PointColorMode extends AbstractMode {

	private colorPicker: HTMLInputElement;
	private point: ModelPoint = null;

	constructor(vecDraw: VecDraw, colorPicker: HTMLInputElement) {
		super(vecDraw);
		this.colorPicker = colorPicker;
		colorPicker.addEventListener("change", (e: Event) => {
			this.point.color = (<HTMLInputElement>e.target).value;
			if (this.point.hasConnections()) {
				this.owner.redrawLines();
			}
		});
	}

	onEnable(): void {
	}
	onDisable(): void {
	}
	onMouseMove(e: MouseEvent): void {
	}
	onMouseDown(e: MouseEvent): void {
	}
	onMouseUp(e: MouseEvent): void {
		this.point = this.owner.pointAt(e.x, e.y);
		if (this.point !== null) {
			this.colorPicker.click();
		}
	}

}

class ConnectPointsMode extends AbstractMode {

	private from: ModelPoint;
	private to: ModelPoint;
	private tempCtx: CanvasRenderingContext2D;
	private canvasLeft: number;
	private canvasTop: number;

	constructor(vecDraw: VecDraw, tempCtx: CanvasRenderingContext2D, canvasLeft: number, canvasTop: number) {
		super(vecDraw);
		this.tempCtx = tempCtx;
		this.from = null;
		this.to = null;
		this.canvasLeft = canvasLeft;
		this.canvasTop = canvasTop;
	}

	onEnable(): void { }
	onDisable(): void {
		this.from = null;
		this.to = null;
	}
	onMouseMove(e: MouseEvent): void {
		//only run if already connected to one point
		if (this.from !== null) {

			//if not connected to "to", find it and draw a line to it
			if (this.to === null) {
				this.to = this.owner.pointAt(e.x, e.y);
				//if "to" is found, draw the line once
				if (this.to !== null) {
					this.tempCtx.clearRect(0, 0, 800, 600);
					this.owner.drawLine(this.tempCtx, this.from, this.to);
				}

				//if already connected to "to", check if still connected
			} else if (this.to.globalPos.distance(new Point(e.x, e.y)) > ModelPoint.radius) {
				this.to = null;
			}

			//only if not connected to "to", draw the line to mouse
			if (this.to === null) {
				this.tempCtx.clearRect(0, 0, 800, 600);
				this.tempCtx.strokeStyle = "white";
				this.tempCtx.beginPath();
				this.tempCtx.moveTo(this.from.canvasPos.x, this.from.canvasPos.y);
				this.tempCtx.lineTo(e.x - this.canvasLeft, e.y - this.canvasTop);
				this.tempCtx.stroke();
			}
		}
	}
	onMouseDown(e: MouseEvent): void {
		this.from = this.owner.pointAt(e.x, e.y);
	}
	onMouseUp(e: MouseEvent): void {
		if (this.from !== null && this.to !== null) {
			this.owner.addLine(this.from.id, this.to.id);
		}
		this.tempCtx.clearRect(0, 0, 800, 600);
		this.from = null;
		this.to = null;
	}
}

class DummyMode implements Mode {
	onEnable(): void { }
	onDisable(): void { }
	onMouseMove(e: MouseEvent): void { }
	onMouseDown(e: MouseEvent): void { }
	onMouseUp(e: MouseEvent): void { }
}

class MovePointMode extends AbstractMode {

	private point: ModelPoint;

	constructor(vecDraw: VecDraw) {
		super(vecDraw);
		this.point = null;
	}

	onMouseDown(e: MouseEvent): void {
		const point = this.owner.pointAt(e.x, e.y);
		if (point != null) {
			this.point = point;
		}
	}
	onMouseMove(e: MouseEvent): void {
		if (this.point !== null) {
			this.point.pos = this.owner.globalToModelPos(new Point(e.x, e.y));
			this.point.resetElemPos();
			if (this.point.hasConnections()) {
				this.owner.redrawLines();
			}
			//this.owner.movePoint(this.pointId, e.x, e.y);
		}
	}
	onMouseUp(e: MouseEvent): void {
		this.point = null;
	}
	onEnable(): void { }
	onDisable(): void { }

}

class AddPointMode extends AbstractMode {

	constructor(vecDraw: VecDraw) {
		super(vecDraw);
	}

	onEnable(): void { }

	onDisable(): void {
		this.owner.resetTemplatePoint();
	}

	onMouseMove(e: MouseEvent): void {
		this.owner.moveTemplatePoint(e.x, e.y);
	}

	onMouseUp(e: MouseEvent): void {
		this.owner.addPoint();
	}

	onMouseDown(e: MouseEvent): void { }
}
