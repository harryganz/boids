
// Globals
const canvas : HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');


let x = 0;
const y = Math.floor(canvas.height/2);
/**
 * Initializes the canvas. Should only run on page load.
 */
function init() : void {
	if (ctx != null) {
		ctx.arc(x,y, 10, 0, 2*Math.PI)
		ctx.fill();
	}
}

let previousTimestamp : number | undefined;
/** Creates a step of animation
 */
function step(timestamp: number) : void {
	if (previousTimestamp === undefined) {
		previousTimestamp = timestamp;
	}
	const dt = timestamp - previousTimestamp // dt in milliseconds
	// Set x velocity to 30px per second
	const dx = 30 * dt/1000
	x += dx;
	if (x < canvas.width) {
		window.requestAnimationFrame(step);
	}
} 

window.onload = () => {
	init();
	window.requestAnimationFrame(step);
}


