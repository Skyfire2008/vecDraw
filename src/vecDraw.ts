var currentMode: Mode;

var xMouse = 0;
var yMouse = 0;

document.addEventListener("DOMContentLoaded", () => {

    const pointTemplate = document.getElementById("pointTemplate");
    const pointHolder = document.getElementById("pointHolder");

    currentMode = new AddPointMode(pointTemplate, pointHolder);

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
