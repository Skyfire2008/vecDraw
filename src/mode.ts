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
