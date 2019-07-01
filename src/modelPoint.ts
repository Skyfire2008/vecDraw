class ModelPoint {

	static readonly radius = 5;
	static readonly radius2 = ModelPoint.radius * ModelPoint.radius;
	private static count: number = -1;

	public pos: Point;
	public readonly owner: VecDraw;
	private connections: Set<Number>;
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

	public containsPoint(x: number, y: number): boolean {
		let dx = this.x - x;
		let dy = this.y - y;
		return dx * dx + dy * dy < ModelPoint.radius2;
	}

	public connectTo(other: ModelPoint) {
		if (other.id !== this.id) {
			this.connections.add(other.id);
			other.connections.add(this.id);
		}
	}

	public resetElemPos() {
		this.elem.setAttribute("style", `left: ${this.pos.x - ModelPoint.radius}px; top: ${this.pos.y - ModelPoint.radius}px`);
	}

	//GETTERS AND SETTERS
	/*get canvasPoint(): Point{

	}*/

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
