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

	constructor(vecDraw: VecDraw, tempCtx: CanvasRenderingContext2D) {
		super(vecDraw);
		this.from = null;
		this.to = null;
		this.tempCtx = tempCtx;
	}

	onEnable(): void { }
	onDisable(): void { }
	onMouseMove(e: MouseEvent): void {
		if (this.from !== null) {
			this.tempCtx.clearRect(0, 0, 800, 600);
			this.tempCtx.beginPath();
			this.tempCtx.moveTo(this.from.x, this.from.y);
			this.tempCtx.lineTo(e.x, e.y);
			this.tempCtx.closePath();
		}
	}
	onMouseDown(e: MouseEvent): void {
		this.from = this.owner.pointAt(e.x, e.y);
	}
	onMouseUp(e: MouseEvent): void {
		throw new Error("Method not implemented.");
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
