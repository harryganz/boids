
// Globals
const canvas : HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');


let x = 0;
const y = Math.floor(canvas.height/2);

interface Drawable {
	draw: (ctx: CanvasRenderingContext2D) => void
}	

type CanvasOpts = {
	width: number
	height: number
}
class Boid implements Drawable {
	x: number
	y: number
	vx: number
	vy: number
	private size: number
	private color: string
	private canvasOpts: CanvasOpts
	constructor(x: number, y: number, canvasOpts: CanvasOpts, opts?: {vx?: number, vy?: number, size?: number, color?: string} ) {
		const {vx, vy, size, color} = opts || {};
		this.x = x;
		this.y = y;
		this.canvasOpts = canvasOpts;
		this.vx = vx || 0;
		this.vy = vy || 0;
		this.size = size || 10;
		this.color = color || "#000000";
	}

	draw(ctx: CanvasRenderingContext2D): void {
		// Creates a circle
		ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.closePath();
		ctx.fill();
	}

	update(dt: number): void {
		const {width, height} = this.canvasOpts;
		if ((this.x + this.vx - this.size) < 0 || (this.x + this.vx + this.size) > width) {
			this.vx = -1*this.vx;
		}
		if ((this.y + this.vy - this.size) < 0 || (this.y + this.vy + this.size) > height) {
			this.vy = -1*this.vy;
		}
		this.x += this.vx * dt/1000;
		this.y += this.vy * dt/1000;
	}
} 
const boids: Boid[] = [];
/**
 * Initializes the canvas. Should only run on page load.
 */
function init() : void {
	if (canvas == null || ctx == null) return;
	// Create 10 boids
	for (let i = 0; i < 10; i++) {
		const boid = new Boid(Math.random()*canvas.width - 10, Math.random()*canvas.height - 10, {width: canvas.width, height: canvas.height}, {vx: Math.random()*100 - 50, vy: Math.random()*100 - 50}); 
		boids.push(boid);
		boid.draw(ctx);
	} 

}

let previousTimestamp : number | undefined;
/** Creates a step of animation
 */
function step(timestamp: number) : void {
	if (ctx == null) return;

	ctx.clearRect(0,0, canvas.width, canvas.height);
	ctx.beginPath();

	if (previousTimestamp === undefined) {
		previousTimestamp = timestamp;
	}

	const dt = timestamp - previousTimestamp // dt in milliseconds
	boids.forEach(boid => {
		boid.update(dt);
		boid.draw(ctx);
	});

	previousTimestamp = timestamp;
	
	window.requestAnimationFrame(step);
} 

window.onload = () => {
	init();
	window.requestAnimationFrame(step);
}


