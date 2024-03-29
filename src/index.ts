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

	const previewCanvas = <HTMLCanvasElement>document.getElementById("previewCanvas");
	const previewCtx = previewCanvas.getContext("2d");

	const gridCanvas = <HTMLCanvasElement>document.getElementById("gridCanvas");
	gridCanvas.setAttribute("style", `left: ${mainRect.left}px; top: ${mainRect.top}px`);

	const xInput = <HTMLInputElement>document.getElementById("xInput");
	const yInput = <HTMLInputElement>document.getElementById("yInput");
	const colorPicker = <HTMLInputElement>document.getElementById("colorPicker");

	vecDraw = new VecDraw(pointTemplate, pointHolder, mainCtx, gridCanvas.getContext("2d"), previewCtx, new Point(mainRect.width, mainRect.height), new Point(mainRect.left, mainRect.top), new Point(10, 10));
	vecDraw.redrawGrid();

	//export model
	const exportBtn = document.getElementById("exportBtn");
	const jsonArea = <HTMLTextAreaElement>document.getElementById("jsonArea");
	exportBtn.addEventListener("click", function () {
		jsonArea.value = vecDraw.toString();
	});

	//import model
	const importBtn = document.getElementById("importBtn");
	importBtn.addEventListener("click", function () {
		vecDraw.scale = scaleInput.valueAsNumber;
		vecDraw.import(JSON.parse(jsonArea.value));
	})

	//toggle points
	const toggleBtn = document.getElementById("togglePointsBtn");
	toggleBtn.addEventListener("click", function () {
		const pointHolder = document.getElementById("pointHolder");
		if (pointHolder.style.visibility === "hidden") {
			pointHolder.style.visibility = "visible";
		} else {
			pointHolder.style.visibility = "hidden";
		}
	});

	//scale input
	const scaleInput = <HTMLInputElement>document.getElementById("scaleInput");
	scaleInput.addEventListener("change", function (e) {
		vecDraw.scale = scaleInput.valueAsNumber;
	});
	scaleInput.value = "1";


	modes = new Map();
	modes.set("a", new AddPointMode(vecDraw, xInput, yInput));
	modes.set("m", new MovePointMode(vecDraw, xInput, yInput));
	modes.set("l", new ConnectPointsMode(vecDraw, tempCtx, mainRect.left, mainRect.top));
	modes.set("b", new AddConnectedPointMode(vecDraw, tempCtx, mainRect.left, mainRect.top, xInput, yInput));
	modes.set("d", new DeleteMode(vecDraw));
	modes.set("s", new SelectMode(vecDraw, xInput, yInput, colorPicker));
	modes.set("r", new MultiSelectMode(vecDraw, tempCtx, xInput, yInput, colorPicker));
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
