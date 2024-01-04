
// Globals
const canvas : HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
const avoidFactor = 0.1;
const matchingFactor = 0.1;
const centeringFactor = 0.01;
const avoidDist = 10;
const maxSpeed = 50;
const minSpeed = 5;


let x = 0;
const y = Math.floor(canvas.height/2);

class Boid {
	x: number
	y: number
	vx: number
	vy: number


	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
	}

	update(neighbors: Boid[]) {
		this.separate(neighbors);
		this.align(neighbors);
		this.cohere(neighbors);
		// Clamp speed
		const speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
		if (speed > maxSpeed) {
			this.vx = (this.vx/speed)*maxSpeed;
			this.vy = (this.vy/speed)*maxSpeed;
		}
		if (speed < minSpeed) {
			this.vx = (this.vx/speed)*minSpeed;
			this.vy = (this.vy/speed)*minSpeed;
		}

		this.x += this.vx;
		this.y += this.vy;
	}

	private separate(neighbors: Boid[]) : void {
		let close_dx = 0;
		let close_dy = 0;
		neighbors.filter(neighbor => dist(this.x, neighbor.x, this.y, neighbor.y) < avoidDist).forEach(neighbor => {
			close_dx += this.x - neighbor.x;
			close_dy += this.y - neighbor.y;
		});
		this.vx += close_dx*avoidFactor;
		this.vy += close_dy*avoidFactor;
	}

	private align(neighbors: Boid[]) : void {
		let [xvel_avg, yvel_avg, neighbor_cnt] = [0, 0, 0]
		neighbors.forEach(neighbor => {
			xvel_avg += neighbor.vx;
			yvel_avg += neighbor.vy;
			neighbor_cnt += 1;
		});
		if (neighbor_cnt > 0) {
			xvel_avg = xvel_avg/neighbor_cnt;
			yvel_avg = yvel_avg/neighbor_cnt;
		}
		this.vx += (xvel_avg - this.vx)*matchingFactor;
		this.vy = (yvel_avg - this.vy)*matchingFactor; 
	}

	private cohere(neighbors: Boid[]) : void {
		let [xpos_avg, ypos_avg, neighbor_cnt] = [0, 0, 0];

		neighbors.forEach(neighbor => {
			xpos_avg += neighbor.x;
			ypos_avg += neighbor.y;
			neighbor_cnt += 1;
		});

		if (neighbor_cnt > 0) {
			xpos_avg = xpos_avg/neighbor_cnt;
			ypos_avg = ypos_avg/neighbor_cnt;
		}

		this.vx += (xpos_avg - this.x)*centeringFactor;
		this.vy += (ypos_avg - this.y)*centeringFactor;
	}

	
}

function dist(x1: number, x2: number, y1: number, y2: number): number {
	return Math.sqrt(Math.pow(x2 - x1,2) + Math.pow(y2 - y1,2));
}
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


