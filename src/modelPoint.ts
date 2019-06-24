class ModelPoint {

	static readonly radius = 5;
	static readonly radius2 = ModelPoint.radius * ModelPoint.radius;
	private static count: number = -1;

	public gridPos: Point;
<<<<<<< HEAD
	private connections: Map<number, ModelPoint>;
=======
	private connections: Set<ModelPoint>;
>>>>>>> d0b2a08e6c757d77a900aa5f0981a520968cfe33
	private _color: string;

	readonly owner: VecDraw;
	readonly id: number;
	readonly elem: HTMLElement;

	constructor(x: number, y: number, owner: VecDraw, color: string, elem: HTMLElement) {
		this.owner = owner;
		this.gridPos = new Point(x, y);
<<<<<<< HEAD
		this.connections = new Map<number, ModelPoint>();
=======
		this.connections = new Set<ModelPoint>();
>>>>>>> d0b2a08e6c757d77a900aa5f0981a520968cfe33
		this.id = ModelPoint.count++;
		this.elem = elem;
		this.color = color;
		this.resetElemPos();
	}

	public containsPoint(x: number, y: number): boolean {
		let dx = this.x - x;
		let dy = this.y - y;
		return dx * dx + dy * dy < ModelPoint.radius2;
	}

	public moveTo(gridPos: Point) {
		this.gridPos = gridPos;
		this.resetElemPos();
	}

	public addDeleteConnection(other: ModelPoint) {
<<<<<<< HEAD
		if (this.connections.has(other.id)) {
			this.connections.delete(other.id);
		} else {
			this.connections.set(other.id, other);
=======
		if (other.id < this.id) {
			other.connectTo(this);
		} else {
			this.connections.push(other);
>>>>>>> d0b2a08e6c757d77a900aa5f0981a520968cfe33
		}
	}

	public resetElemPos() {
		this.elem.setAttribute("style", `left: ${this.x}px; top: ${this.y}px`);
	}

	//GETTERS AND SETTERS
	set color(color: string) {
		this._color = color;
		this.elem.querySelector(".innerCircle").setAttribute("fill", color);
	}
	get color(): string {
		return this._color;
	}
	get x(): number {
		return this.gridPos.x * this.owner.gridWidth + this.owner.canvasLeft - ModelPoint.radius;
	}
	get y(): number {
		return this.gridPos.y * this.owner.gridHeight + this.owner.canvasTop - ModelPoint.radius;
	}

}
