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
		this.owner.moveTemplatePoint(new Point(e.x, e.y));
		if (this.prevPoint !== null) {
			this.tempCtx.clearRect(0, 0, 800, 600);
			this.tempCtx.beginPath();
			this.tempCtx.moveTo(this.prevPoint.x - this.canvasLeft, this.prevPoint.y - this.canvasTop);
			this.tempCtx.lineTo(e.x - this.canvasLeft, e.y - this.canvasTop);
			this.tempCtx.stroke();
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
		const foo = this.owner.pointAt(new Point(e.x, e.y));
		if (foo !== null) {
			this.prevPoint = foo;
			this.owner.setCurrentColor(this.prevPoint.color);
		}
	}
}

class PointColorMode extends AbstractMode {

	private colorPicker: HTMLInputElement;
	private pointId: number = -1;

	constructor(vecDraw: VecDraw, colorPicker: HTMLInputElement) {
		super(vecDraw);
		this.colorPicker = colorPicker;
		colorPicker.addEventListener("change", (e: Event) => {
			this.owner.setPointColor(this.pointId, (<HTMLInputElement>e.target).value);
			this.owner.redrawLines();
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
		this.pointId = this.owner.pointAt(new Point(e.x, e.y));
		if (this.pointId !== -1) {
			this.colorPicker.click();
		}
	}

}

class ConnectPointsMode extends AbstractMode {

	private from: number;
	private to: number;
	private tempCtx: CanvasRenderingContext2D;
	private canvasLeft: number;
	private canvasTop: number;

	constructor(vecDraw: VecDraw, tempCtx: CanvasRenderingContext2D, canvasLeft: number, canvasTop: number) {
		super(vecDraw);
		this.tempCtx = tempCtx;
		this.from = -1;
		this.to = -1;
		this.canvasLeft = canvasLeft;
		this.canvasTop = canvasTop;
	}

	onEnable(): void { }
	onDisable(): void {
		this.from = -1;
		this.to = -1;
	}
	onMouseMove(e: MouseEvent): void {
		//only run if already connected to one point
		if (this.from !== -1) {

			//if not connected to "to", find it and draw a line to it
			if (this.to === -1) {
				this.to = this.owner.pointAt(new Point(e.x, e.y));
				//if "to" is found, draw the line once
				if (this.to !== null) {
					this.tempCtx.clearRect(0, 0, 800, 600);
					this.tempCtx.beginPath();
					this.tempCtx.moveTo(this.from.x - this.canvasLeft, this.from.y - this.canvasTop);
					this.tempCtx.lineTo(this.to.x - this.canvasLeft, this.to.y - this.canvasTop);
					this.tempCtx.stroke();
				}

				//if already connected to "to", check if still connected
			} else if (!this.to.containsPoint(e.x, e.y)) {
				this.to = null;
			}

			//only if not connected to "to", draw the line to mouse
			if (this.to === null) {
				this.tempCtx.clearRect(0, 0, 800, 600);
				this.tempCtx.beginPath();
				this.tempCtx.moveTo(this.from.x - this.canvasLeft, this.from.y - this.canvasTop);
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

	private pointId: number;
	private translation: Point;

	constructor(vecDraw: VecDraw) {
		super(vecDraw);
		this.pointId = -1;
		this.translation = null;
	}

	onMouseDown(e: MouseEvent): void {
		const point = this.owner.pointAt(e.x, e.y);
		if (point != null) {
			this.pointId = point.id;
			this.translation = new Point(point.x - e.x, point.y - e.y);
		}
	}
	onMouseMove(e: MouseEvent): void {
		if (this.pointId >= 0) {
			this.owner.movePoint(this.pointId, new Point(e.x, e.y));
		}
	}
	onMouseUp(e: MouseEvent): void {
		this.pointId = -1;
		this.translation = null;
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
		this.owner.moveTemplatePoint(new Point(e.x, e.y));
	}

	onMouseUp(e: MouseEvent): void {
		this.owner.addPoint();
	}

	onMouseDown(e: MouseEvent): void { }
}
