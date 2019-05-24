export class Point {
    public x: number;
    public y: number;
    public color: string;

    public constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    public dot(other: Point): number {
        return this.x * other.x + this.y * other.y;
    };

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(): Point {
        return new Point(this.x / this.length(), this.y / this.length(), this.color);
    }
}
