interface Mode {
    onEnable(): void;
    onDisable(): void;
    onMouseMove(e: MouseEvent): void;
    onMouseDown(e: MouseEvent): void;
    onMouseUp(e: MouseEvent): void;
}

class AddPointMode implements Mode {

    private pointTemplate: HTMLElement;
    private pointHolder: HTMLElement;
    private pointNum: number;

    constructor(pointTemplate: HTMLElement, pointHolder: HTMLElement) {
        this.pointNum = 0;
        this.pointHolder = pointHolder;
        this.pointTemplate = pointTemplate;
    }

    onEnable(): void {
        //empty
    }

    onDisable(): void { }

    onMouseMove(e: MouseEvent): void {
        this.pointTemplate.setAttribute("style", `left: ${e.x - 10}; top: ${e.y - 10}`);
    }

    onMouseUp(e: MouseEvent): void {
        const clone = <HTMLElement>this.pointTemplate.cloneNode(true);
        clone.setAttribute("id", `point${this.pointNum}`);
        this.pointNum++;
        this.pointHolder.appendChild(clone);
    }

    onMouseDown(e: MouseEvent): void { }
}
