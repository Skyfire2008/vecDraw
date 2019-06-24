class ModelPoint {

	static readonly radius = 5;
	static readonly radius2 = ModelPoint.radius * ModelPoint.radius;
	private static count: number = -1;

	public gridPos: Point;
	private connections: Set<ModelPoint>;
	private _color: string;

	readonly owner: VecDraw;
	readonly id: number;
	readonly elem: HTMLElement;

	constructor(x: number, y: number, owner: VecDraw, color: string, elem: HTMLElement) {
		this.owner = owner;
		this.gridPos = new Point(x, y);
		this.connections = new Set<ModelPoint>();
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
		if (other.id < this.id) {
			other.connectTo(this);
		} else {
			this.connections.push(other);
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
