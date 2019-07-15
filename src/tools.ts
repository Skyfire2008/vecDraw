class Tools {
	public static makeRect(a: Point, b: Point): DOMRect {
		return new DOMRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(a.x - b.x), Math.abs(a.y - b.y));
	}
}