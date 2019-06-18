let currentMode: Mode;
let modes: Map<string, Mode>;

let vecDraw: VecDraw;

document.addEventListener("DOMContentLoaded", () => {

	const pointTemplate = document.getElementById("pointTemplate");
	const pointHolder = document.getElementById("pointHolder");

	const mainCanvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
	const mainRect = mainCanvas.getBoundingClientRect();
	const mainCtx = mainCanvas.getContext("2d");
	mainCtx.lineWidth = 2;

	const tempCanvas = <HTMLCanvasElement>document.getElementById("tempCanvas");
	tempCanvas.setAttribute("style", `left: ${mainRect.left}px; top: ${mainRect.top}px`);
	const tempCtx = tempCanvas.getContext("2d");
	tempCtx.lineWidth = 2;
	tempCtx.strokeStyle = "white";

	const gridCanvas = <HTMLCanvasElement>document.getElementById("gridCanvas");
	gridCanvas.setAttribute("style", `left: ${mainRect.left}px; top: ${mainRect.top}px`);

	vecDraw = new VecDraw(pointTemplate, pointHolder, mainCtx, gridCanvas.getContext("2d"), mainRect.left, mainRect.top);
	vecDraw.gridWidth = 20;
	vecDraw.gridHeight = 20;
	vecDraw.redrawGrid();

	modes = new Map();
	modes.set("a", new AddPointMode(vecDraw));
	modes.set("m", new MovePointMode(vecDraw));
	modes.set("l", new ConnectPointsMode(vecDraw, tempCtx, mainRect.left, mainRect.top));
	modes.set("c", new PointColorMode(vecDraw, <HTMLInputElement>document.getElementById("colorPicker")));
	modes.set("b", new AddConnectedPointMode(vecDraw, tempCtx, mainRect.left, mainRect.top));
	currentMode = new DummyMode();
});

document.addEventListener("keyup", (e: KeyboardEvent) => {
	console.log(e.key);
	let mode = modes.get(e.key);
	if (mode !== undefined) {
		currentMode.onDisable();
		mode.onEnable();
		currentMode = mode;
	}
});

document.addEventListener("mousemove", (e: MouseEvent) => {
	currentMode.onMouseMove(e);
});

document.addEventListener("mouseup", (e: MouseEvent) => {
	currentMode.onMouseUp(e);
});

document.addEventListener("mousedown", (e: MouseEvent) => {
	currentMode.onMouseDown(e);
});
