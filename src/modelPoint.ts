class ModelPoint {

	public static readonly radius = 5;
	public static readonly radius2 = ModelPoint.radius * ModelPoint.radius;
	private static count: number = -1;

	public pos: Point;
	public readonly owner: VecDraw;
	private connections: Set<number>;
	private _color: string;
	public readonly id: number;
	public readonly elem: HTMLElement;

	constructor(x: number, y: number, owner: VecDraw, color: string, elem: HTMLElement) {
		this.pos = new Point(x, y);
		this.owner = owner;
		this.connections = new Set<number>();
		this.id = ModelPoint.count++;
		this.elem = elem;
		this.color = color;
		this.resetElemPos();
	}

	/*public containsPoint(x: number, y: number): boolean {
		let dx = this.x - x;
		let dy = this.y - y;
		return dx * dx + dy * dy < ModelPoint.radius2;
	}*/

	public connectTo(other: ModelPoint) {
		if (other.id !== this.id) {
			this.connections.add(other.id);
			other.connections.add(this.id);
		}
	}

	public disconnectFrom(other: ModelPoint): boolean {
		if (this.connections.has(other.id)) {
			this.connections.delete(other.id);
			other.connections.delete(this.id);
			return true;
		} else {
			return false;
		}
	}

	public hasConnections(): boolean {
		return this.connections.size > 0;
	}

	public getConnections(): Array<number> {
		const result: Array<number> = [];
		for (let id of this.connections) {
			result.push(id);
		}
		return result;
	}

	public resetElemPos() {
		const x = this.pos.x * this.owner.gridWidth - ModelPoint.radius + this.owner.canvasPos.x;
		const y = this.pos.y * this.owner.gridHeight - ModelPoint.radius + this.owner.canvasPos.y;
		this.elem.setAttribute("style", `left: ${x}px; top: ${y}px`);
	}

	//GETTERS AND SETTERS
	get canvasPos(): Point {
		const x = this.pos.x * this.owner.gridWidth;
		const y = this.pos.y * this.owner.gridHeight;
		return new Point(x, y);
	}

	get globalPos(): Point {
		return this.canvasPos.add(this.owner.canvasPos);
	}

	set color(color: string) {
		this._color = color;
		this.elem.querySelector(".innerCircle").setAttribute("fill", color);
	}
	get color(): string {
		return this._color;
	}

	get x(): number { return this.pos.x; }
	set x(x: number) {
		this.pos.x = x;
	}

	get y(): number { return this.pos.y; }
	set y(y: number) {
		this.pos.y = y;
	}
}
