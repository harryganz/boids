
// Globals
const canvas : HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');


interface Drawable {
	draw: (ctx: CanvasRenderingContext2D) => void
}	

type CanvasOpts = {
	width: number
	height: number
	avoidFactor: number
	neighborDist: number
	closeDist: number
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

	update(dt: number, neighbors: Boid[]): void {
		const {width, height, closeDist} = this.canvasOpts;
		this.separate(neighbors.filter(boid => dist(this, boid) < closeDist));
		const timeFactor = dt/1000;
		if (!this.isCollided(width, height, this.vx*timeFactor, this.vy*timeFactor)) {
			this.x += this.vx * dt/1000;
			this.y += this.vy * dt/1000;
		}
	}

	// Returns true if boid has collided with canvas walls
	// will also set position to just have bounced off of wall if 
	// collided
	// NOTE: Probably should set value to where it would be if it 
	// had collided
	private isCollided(width: number, height: number, dx: number, dy: number): boolean {
		let collided = false;
		// Collided with left side
		if (this.x + dx - this.size < 0) {
			this.x = 0 + this.size;
			this.vx = Math.abs(this.vx);
			collided = true;
		}
		// Collided with right side
		if (this.x + dx + this.size > width) {
			this.x = width - this.size;
			this.vx = -1 * Math.abs(this.vx);
			collided = true
		}
		// Collided with top
		if (this.y + dy - this.size < 0) {
			this.y = 0 + this.size;
			this.vy = Math.abs(this.vy);
			collided = true;
		}
		// Collided with bottom
		if (this.y + dy + this.size > height) {
			this.y = height - this.size;
			this.vy = -1 * Math.abs(this.vy);
			collided = true;
		}

		return collided;
	}

	private separate(closeNeighbors: Boid[]) {
		let [dx, dy] = [0, 0];
		const {avoidFactor} = this.canvasOpts;

		for (let i = 0; i < closeNeighbors.length; i++) {
			dx += this.x - closeNeighbors[i].x;
			dy += this.y - closeNeighbors[i].y;
		} 

		this.vx += dx*avoidFactor;
		this.vy += dy*avoidFactor;
	}
}  

function dist(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

const boids: Boid[] = [];
const canvasOpts = {width: canvas.width, height: canvas.height, avoidFactor: 0.1, neighborDist: 100, closeDist: 50};
/**
 * Initializes the canvas. Should only run on page load.
 */
function init() : void {
	if (canvas == null || ctx == null) return;
	// Create 10 boids
	for (let i = 0; i < 10; i++) {
		const boid = new Boid(Math.random()*(canvas.width - 20) + 10, Math.random()*(canvas.height - 20) + 10, canvasOpts, {vx: Math.random()*400 - 200, vy: Math.random()*400 - 200}); 
		boids.push(boid);
		boid.draw(ctx);
	} 

}

let previousTimestamp : number | undefined;
/** Creates a step of animation
 */
function step(timestamp: number) : void {
	if (ctx == null) return;

		if (previousTimestamp === undefined) {
		previousTimestamp = timestamp;
	}

	const dt = timestamp - previousTimestamp // dt in milliseconds
	// Skip animation if longer than 0.3s, implies 
	// tab was closed
	if (dt < 100) {
		ctx.clearRect(0,0, canvas.width, canvas.height);
		ctx.beginPath();

		boids.forEach(boid => {
			const neighbors = boids.filter(neighbor => dist(boid, neighbor) < canvasOpts.neighborDist);
			boid.update(dt, neighbors);
			boid.draw(ctx);
		});
	}

	previousTimestamp = timestamp;
	
	window.requestAnimationFrame(step);
} 

window.onload = () => {
	init();
	window.requestAnimationFrame(step);
}


