class ModelPoint {

	static readonly radius = 5;
	static readonly radius2 = ModelPoint.radius * ModelPoint.radius;
	private static count: number = -1;

	public gridPos: Point;
	private connections: Set<number>;
	private _color: string;

	readonly owner: VecDraw;
	readonly id: number;
	readonly elem: HTMLElement;

	constructor(gridPos: Point, owner: VecDraw, color: string, elem: HTMLElement) {
		this.owner = owner;
		this.gridPos = gridPos;
		this.connections = new Set<number>();
		this.id = ModelPoint.count++;
		this.elem = elem;
		this.color = color;
		this.resetElemPos();
	}

	public connectTo(otherID: number) {
		this.connections.add(otherID);
	}

	public getConnections(): Array<number> {
		const result: Array<number> = [];
		for (let i of this.connections) {
			result.push(i);
		}
		return result;
	}

	public containsPoint(pos: Point): boolean {
		//TODO: use distance function of Point, cache actuall coordinates(x, y)
		let dx = this.x - pos.x;
		let dy = this.y - pos.y;
		return dx * dx + dy * dy < ModelPoint.radius2;
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
