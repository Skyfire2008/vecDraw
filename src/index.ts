let currentMode: Mode;
let modes: Map<string, Mode>;

let vecDraw: VecDraw;
let mainRect: ClientRect | DOMRect;

document.addEventListener("DOMContentLoaded", () => {

	const pointTemplate = document.getElementById("pointTemplate");
	const pointHolder = document.getElementById("pointHolder");

	const mainCanvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
	mainRect = mainCanvas.getBoundingClientRect();
	const mainCtx = mainCanvas.getContext("2d");
	mainCtx.lineWidth = 2;

	const tempCanvas = <HTMLCanvasElement>document.getElementById("tempCanvas");
	tempCanvas.setAttribute("style", `left: ${mainRect.left}px; top: ${mainRect.top}px`);
	const tempCtx = tempCanvas.getContext("2d");
	tempCtx.lineWidth = 2;
	tempCtx.strokeStyle = "white";

	const gridCanvas = <HTMLCanvasElement>document.getElementById("gridCanvas");
	gridCanvas.setAttribute("style", `left: ${mainRect.left}px; top: ${mainRect.top}px`);

	const xInput = <HTMLInputElement>document.getElementById("xInput");
	const yInput = <HTMLInputElement>document.getElementById("yInput");
	const colorPicker = <HTMLInputElement>document.getElementById("colorPicker");

	vecDraw = new VecDraw(pointTemplate, pointHolder, mainCtx, gridCanvas.getContext("2d"), new Point(mainRect.width, mainRect.height), new Point(mainRect.left, mainRect.top), new Point(10, 10));
	vecDraw.redrawGrid();

	//export model
	const exportBtn = document.getElementById("exportBtn");
	const jsonArea = <HTMLTextAreaElement>document.getElementById("jsonArea");
	exportBtn.addEventListener("click", function () {
		jsonArea.value = vecDraw.toString();
	});

	modes = new Map();
	modes.set("a", new AddPointMode(vecDraw));
	modes.set("m", new MovePointMode(vecDraw));
	modes.set("l", new ConnectPointsMode(vecDraw, tempCtx, mainRect.left, mainRect.top));
	modes.set("b", new AddConnectedPointMode(vecDraw, tempCtx, mainRect.left, mainRect.top));
	modes.set("d", new DeleteMode(vecDraw));
	modes.set("s", new SelectMode(vecDraw, document, xInput, yInput, colorPicker));
	modes.set("r", new MultiSelectMode(vecDraw, tempCtx));
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
	if (e.x >= mainRect.left && e.x < mainRect.right && e.y >= mainRect.top && e.y < mainRect.bottom) {
		currentMode.onMouseMove(e);
		e.preventDefault();
		e.stopPropagation();
	}
});

document.addEventListener("mouseup", (e: MouseEvent) => {
	if (e.x >= mainRect.left && e.x < mainRect.right && e.y >= mainRect.top && e.y < mainRect.bottom) {
		currentMode.onMouseUp(e);
		e.preventDefault();
		e.stopPropagation();
	}
});

document.addEventListener("mousedown", (e: MouseEvent) => {
	if (e.x >= mainRect.left && e.x < mainRect.right && e.y >= mainRect.top && e.y < mainRect.bottom) {
		currentMode.onMouseDown(e);
		e.preventDefault();
		e.stopPropagation();
	}
});
