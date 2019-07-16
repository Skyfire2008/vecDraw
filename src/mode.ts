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

	protected clearCtx(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, this.owner.canvasSize.x, this.owner.canvasSize.y);
	}

	abstract onEnable(): void;
	abstract onDisable(): void;
	abstract onMouseMove(e: MouseEvent): void;
	abstract onMouseDown(e: MouseEvent): void;
	abstract onMouseUp(e: MouseEvent): void;
}

enum MSModeMode {
	drag = "DRAG",
	select = "SELECT"
}

class MultiSelectMode extends AbstractMode {

	private tempCtx: CanvasRenderingContext2D;
	private xInput: HTMLInputElement;
	private yInput: HTMLInputElement;
	private colorPicker: HTMLInputElement;

	private mode: MSModeMode;
	private startPos: Point;
	private selection: Map<number, ModelPoint>;
	private selectionPos: Point;

	private redraw() {
		let needRedraw = false;

		for (const point of this.selection.values()) {
			point.resetElemPos();
			if (!needRedraw && point.hasConnections()) {
				needRedraw = true;
			}
		}

		if (needRedraw) {
			this.owner.redrawLines();
		}
	}

	private calcSelectionPos() {
		this.selectionPos = new Point(0, 0);
		for (const point of this.selection.values()) {
			this.selectionPos = this.selectionPos.add(point.pos);
		}
		if (this.selection.size > 0) {
			this.selectionPos = this.selectionPos.mult(1 / this.selection.size);
		}
	}

	private resetInputs() {
		this.xInput.value = "" + this.selectionPos.x;
		this.yInput.value = "" + this.selectionPos.y;
	}

	constructor(vecDraw: VecDraw, tempCtx: CanvasRenderingContext2D, xInput: HTMLInputElement, yInput: HTMLInputElement, colorPicker: HTMLInputElement) {
		super(vecDraw);
		this.tempCtx = tempCtx;
		this.xInput = xInput;
		this.yInput = yInput;
		this.colorPicker = colorPicker;

		this.mode = null;
		this.startPos = null;
		this.selection = new Map<number, ModelPoint>();
		this.selectionPos = null;

		xInput.addEventListener("input", (e: Event) => {
			if (this.selection.size !== 0) {
				const newX = parseFloat(this.xInput.value);
				if (!isNaN(newX) && newX !== this.selectionPos.x) {
					for (const point of this.selection.values()) {
						point.x += newX - this.selectionPos.x;
					}
					this.selectionPos.x = newX;
					this.redraw();
				}
			}
		});

		yInput.addEventListener("input", (e: Event) => {
			if (this.selection.size !== 0) {
				const newY = parseFloat(this.yInput.value);
				if (!isNaN(newY) && newY !== this.selectionPos.y) {
					for (const point of this.selection.values()) {
						point.y += newY - this.selectionPos.y;
					}
					this.selectionPos.y = newY;
					this.redraw();
				}
			}
		});

		colorPicker.addEventListener("change", (e: Event) => {
			if (this.selection.size !== 0) {
				for (const point of this.selection.values()) {
					point.color = (<HTMLInputElement>e.target).value;
				}
				this.redraw();
			} else {
				//FIXME: setting listener for current color shouldn't be this class'es responsibility
				this.owner.setCurrentColor((<HTMLInputElement>e.target).value);
			}
		});
	}

	onEnable(): void {
		//this.tempCtx.lineWidth = 1;
		this.tempCtx.strokeStyle = "white";
	}
	onDisable(): void {
		this.mode = null;
		this.clearCtx(this.tempCtx);
		for (const point of this.selection.values()) {
			point.deselect();
		}
		this.selection.clear();
		//this.tempCtx.lineWidth = 2;
	}
	onMouseMove(e: MouseEvent): void {

		if (this.mode === MSModeMode.select) {
			this.clearCtx(this.tempCtx);
			this.tempCtx.beginPath();
			this.tempCtx.setLineDash([5]);

			const rect = Tools.makeRect(this.startPos, new Point(e.x, e.y));
			rect.x -= this.owner.canvasPos.x;
			rect.y -= this.owner.canvasPos.y;
			this.tempCtx.rect(rect.x, rect.y, rect.width, rect.height);
			this.tempCtx.closePath();
			this.tempCtx.stroke();
		}
	}
	onMouseDown(e: MouseEvent): void {
		if (this.mode === null) {
			this.mode = MSModeMode.select;
			this.startPos = new Point(e.x, e.y);
		}
	}
	onMouseUp(e: MouseEvent): void {
		if (this.mode = MSModeMode.select) {
			const points = this.owner.pointsInRect(Tools.makeRect(this.startPos, new Point(e.x, e.y)));

			if (e.shiftKey) { //if shift was pressed, add points
				for (const point of points) {
					if (!this.selection.has(point.id)) {
						this.selection.set(point.id, point);
						point.select();
					}
				}

				this.calcSelectionPos();
				this.resetInputs();

			} else if (e.ctrlKey) { //if ctrl was pressed, remove points
				window.requestAnimationFrame(() => { //use reuqest animation frame, otherwise attribute removal won't work
					for (const point of points) {
						if (this.selection.has(point.id)) {
							this.selection.delete(point.id);
							point.deselect();
						}
					}

					this.calcSelectionPos();
					this.resetInputs();
				});
			} else { //otherwise, overwrite points map
				window.requestAnimationFrame(() => {
					for (const point of this.selection.values()) {
						point.deselect();
					}

					this.selection.clear();
					for (const point of points) {
						this.selection.set(point.id, point);
						point.select();
					}

					this.calcSelectionPos();
					this.resetInputs();
				});
			}

			for (const point of points) {
				point.select();
			}
			this.clearCtx(this.tempCtx);
		}
		this.mode = null;
	}
}

class SelectMode extends AbstractMode {

	private xInput: HTMLInputElement;
	private yInput: HTMLInputElement;
	private colorPicker: HTMLInputElement;
	private selection: ModelPoint = null;

	constructor(vecDraw: VecDraw, xInput: HTMLInputElement, yInput: HTMLInputElement, colorPicker: HTMLInputElement) {
		super(vecDraw);
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
		document.addEventListener("keydown", this.onKeyDown);
	}
	onDisable(): void {
		this.selection = null;
		document.removeEventListener("keydown", this.onKeyDown);
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
		this.clearCtx(this.tempCtx);
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
				this.clearCtx(this.tempCtx);
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
					this.clearCtx(this.tempCtx);
					this.owner.drawLine(this.tempCtx, this.from, this.to);
				}

				//if already connected to "to", check if still connected
			} else if (this.to.globalPos.distance(new Point(e.x, e.y)) > ModelPoint.radius) {
				this.to = null;
			}

			//only if not connected to "to", draw the line to mouse
			if (this.to === null) {
				this.clearCtx(this.tempCtx);
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
		this.clearCtx(this.tempCtx);
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
