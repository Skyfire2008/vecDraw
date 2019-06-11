var currentMode: Mode;

var vecDraw: VecDraw;

document.addEventListener("DOMContentLoaded", () => {

    const pointTemplate = document.getElementById("pointTemplate");
    const pointHolder = document.getElementById("pointHolder");

    vecDraw = new VecDraw(pointTemplate, pointHolder);
    currentMode = new AddPointMode(vecDraw);

    console.log("hello world!");
});

document.addEventListener("keyup", (e: KeyboardEvent) => {
    console.log(e.key);
});

document.addEventListener("mousemove", (e: MouseEvent) => {
    currentMode.onMouseMove(e);
});

document.addEventListener("mouseup", (e: MouseEvent) => {
    currentMode.onMouseUp(e);
});
