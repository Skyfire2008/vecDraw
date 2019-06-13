let currentMode: Mode;
let modes: Map<string, Mode>;

let vecDraw: VecDraw;

document.addEventListener("DOMContentLoaded", () => {

	const pointTemplate = document.getElementById("pointTemplate");
	const pointHolder = document.getElementById("pointHolder");

	const mainCanvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
	const tempCanvas = <HTMLCanvasElement>document.getElementById("tempCanvas");
	const mainRect = mainCanvas.getBoundingClientRect();

	vecDraw = new VecDraw(pointTemplate, pointHolder);
	modes = new Map();
	modes.set("a", new AddPointMode(vecDraw));
	modes.set("m", new MovePointMode(vecDraw));
	modes.set("c", new ConnectPointsMode(vecDraw, tempCanvas.getContext("2d")));
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
