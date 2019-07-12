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

class MultiSelectMode extends AbstractMode {
	onEnable(): void {
		throw new Error("Method not implemented.");
	}
	onDisable(): void {
		throw new Error("Method not implemented.");
	}
	onMouseMove(e: MouseEvent): void {
		throw new Error("Method not implemented.");
	}
	onMouseDown(e: MouseEvent): void {
		throw new Error("Method not implemented.");
	}
	onMouseUp(e: MouseEvent): void {
		throw new Error("Method not implemented.");
	}


}

class SelectMode extends AbstractMode {

	private xInput: HTMLInputElement;
	private yInput: HTMLInputElement;
	private colorPicker: HTMLInputElement;
	private doc: Document;

	private selection: ModelPoint = null;

	constructor(vecDraw: VecDraw, doc: Document, xInput: HTMLInputElement, yInput: HTMLInputElement, colorPicker: HTMLInputElement) {
		super(vecDraw);
		this.doc = doc;
		this.xInput = xInput;
		this.yInput = yInput;
		this.colorPicker = colorPicker;

		xInput.addEventListener("input", (e: Event) => {
			if (this.selection !== null) {
				this.selection.pos.x = parseFloat(this.xInput.value);
				this.redraw();
			}
		});

		yInput.addEventListener("input", (e: Event) => {
			if (this.selection !== null) {
				this.selection.pos.y = parseFloat(this.yInput.value);
				this.redraw();
			}
		});

		colorPicker.addEventListener("change", (e: Event) => {
			if (this.selection !== null) {
				this.selection.color = (<HTMLInputElement>e.target).value;
				this.redraw();
			} else {
				//FIXME: setting listener for current color shouldn't be this class'es responsibility
				this.owner.setCurrentColor((<HTMLInputElement>e.target).value);
			}
		});
	}

	private redraw() {
		this.selection.resetElemPos();
		if (this.selection.hasConnections()) {
			this.owner.redrawLines();
		}
	}

	private onKeyDown = (e: KeyboardEvent) => {
		if (this.selection !== null) {
			let posChanged = false;
			switch (e.keyCode) {
				case 37: //left
					this.selection.x -= 1 / this.owner.gridWidth;
					posChanged = true;
					break;
				case 38: //up
					this.selection.y -= 1 / this.owner.gridHeight;
					posChanged = true;
					break;
				case 39: //right
					this.selection.x += 1 / this.owner.gridWidth;
					posChanged = true;
					break;
				case 40: //down
					this.selection.y += 1 / this.owner.gridHeight;
					posChanged = true;
					break;
			}

			if (posChanged) {
				this.xInput.value = "" + this.selection.x;
				this.yInput.value = "" + this.selection.y;
				this.redraw();
			}
		}
	}

	onEnable(): void {
		this.doc.addEventListener("keydown", this.onKeyDown);
	}
	onDisable(): void {
		this.selection = null;
		this.doc.removeEventListener("keydown", this.onKeyDown);
		this.colorPicker.setAttribute("value", this.owner.getCurrentColor());
		this.colorPicker.value = this.colorPicker.defaultValue;
	}
	onMouseMove(e: MouseEvent): void {
	}
	onMouseDown(e: MouseEvent): void {
		this.selection = this.owner.pointAt(e.x, e.y);
		if (this.selection !== null) {
			this.xInput.value = "" + this.selection.x;
			this.yInput.value = "" + this.selection.y;
			this.colorPicker.setAttribute("value", this.selection.color);
			this.colorPicker.value = this.colorPicker.defaultValue;
		} else {
			this.colorPicker.setAttribute("value", this.owner.getCurrentColor());
			this.colorPicker.value = this.colorPicker.defaultValue;
		}
	}
	onMouseUp(e: MouseEvent): void {
	}
}

class DeleteMode extends AbstractMode {

	private from: ModelPoint;
	private to: ModelPoint;

	constructor(vecDraw: VecDraw) {
		super(vecDraw);
		this.from = null;
		this.to = null;
	}

	onEnable(): void {
	}
	onDisable(): void {
		this.from = null;
		this.to = null;
	}
	onMouseMove(e: MouseEvent): void {
	}
	onMouseDown(e: MouseEvent): void {
		this.from = this.owner.pointAt(e.x, e.y);
	}
	onMouseUp(e: MouseEvent): void {
		this.to = this.owner.pointAt(e.x, e.y);
		if (this.from != null) {
			if (this.to.id !== this.from.id) {
				this.owner.removeLine(this.to.id, this.from.id);
			} else {
				this.owner.removePoint(this.from.id);
			}
		}

		this.to = null;
		this.from = null;
	}
}

class AddConnectedPointMode extends AbstractMode {
	private prevPoint: ModelPoint;
	private nextPoint: ModelPoint;
	private tempCtx: CanvasRenderingContext2D;
	private canvasLeft: number;
	private canvasTop: number;

	constructor(vecDraw: VecDraw, tempCtx: CanvasRenderingContext2D, canvasLeft: number, canvasTop: number) {
		super(vecDraw);
		this.prevPoint = null;
		this.nextPoint = null;
		this.tempCtx = tempCtx;
		this.canvasLeft = canvasLeft;
		this.canvasTop = canvasTop;
	}

	onEnable(): void { }
	onDisable(): void {
		this.prevPoint = null;
		this.tempCtx.clearRect(0, 0, this.owner.canvasSize.x, this.owner.canvasSize.y);
		this.owner.resetTemplatePoint();
	}

	onMouseMove(e: MouseEvent): void {

		if (this.nextPoint === null) {
			this.owner.moveTemplatePoint(e.x, e.y);
		}

		if (this.prevPoint !== null) {

			//if next point not found...
			if (this.nextPoint === null) {

				this.nextPoint = this.owner.pointAt(e.x, e.y);
				this.tempCtx.clearRect(0, 0, this.owner.canvasSize.x, this.owner.canvasSize.y);
				if (this.nextPoint === null) { //if found, draw line to next point
					this.owner.drawLine(this.tempCtx, this.prevPoint, this.owner.templatePoint);
				} else {
					this.owner.drawLine(this.tempCtx, this.prevPoint, this.nextPoint);
					this.owner.resetTemplatePoint();
				}
			} else { //otherwise check that mouse still above next point
				if (this.nextPoint.globalPos.distance(new Point(e.x, e.y)) > ModelPoint.radius) {
					this.nextPoint = null;
				}
			}
		}
	}

	onMouseUp(e: MouseEvent): void {

		let newPoint = this.nextPoint;

		if (newPoint === null) {
			newPoint = this.owner.addPoint();
		}
		if (this.prevPoint !== null) {
			this.owner.addLine(this.prevPoint.id, newPoint.id);
		}

		this.prevPoint = newPoint;
	}

	onMouseDown(e: MouseEvent): void {
		if (this.nextPoint === null) { //if next point not null, prev point is also not null, no need to find it
			const foo = this.owner.pointAt(e.x, e.y);
			if (foo !== null) {
				this.prevPoint = foo;
			}
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
					this.tempCtx.clearRect(0, 0, this.owner.canvasSize.x, this.owner.canvasSize.y);
					this.owner.drawLine(this.tempCtx, this.from, this.to);
				}

				//if already connected to "to", check if still connected
			} else if (this.to.globalPos.distance(new Point(e.x, e.y)) > ModelPoint.radius) {
				this.to = null;
			}

			//only if not connected to "to", draw the line to mouse
			if (this.to === null) {
				this.tempCtx.clearRect(0, 0, this.owner.canvasSize.x, this.owner.canvasSize.y);
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
		this.tempCtx.clearRect(0, 0, this.owner.canvasSize.x, this.owner.canvasSize.y);
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
