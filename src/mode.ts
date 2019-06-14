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
			this.owner.movePoint(this.pointId, e.x + this.translation.x, e.y + this.translation.y);
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

	private pointNum: number;

	constructor(vecDraw: VecDraw) {
		super(vecDraw);
	}

	onEnable(): void { }

	onDisable(): void { }

	onMouseMove(e: MouseEvent): void {
		this.owner.moveTemplatePoint(e.x, e.y);
	}

	onMouseUp(e: MouseEvent): void {
		this.owner.addPoint();
	}

	onMouseDown(e: MouseEvent): void { }
}
