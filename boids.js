"use strict";
const defaultCanvasOpts = {
    avoidFactor: 0.05,
    cohereFactor: 0.03,
    alignFactor: 0.02,
    neighborDist: 100,
    closeDist: 33,
    minSpeed: 20,
    maxSpeed: 100,
    buffer: 100
};
class Boid {
    /**
     * Boid represents a "bird like object" that engages in flocking behavior with other boids.
     */
    constructor(x, y, canvasOpts, opts) {
        const { vx, vy, size, color } = opts || {};
        this.x = x;
        this.y = y;
        this.canvasOpts = canvasOpts;
        this.vx = vx || 0;
        this.vy = vy || 0;
        this.size = size || 5;
        this.color = color || "#000000";
    }
    /**
     * Set options for this boid
     */
    setOpts(opts) {
        this.vx = opts.vx || this.vx;
        this.vy = opts.vy || this.vy;
        this.size = opts.size || this.size;
        this.color = opts.color || this.color;
    }
    /**
     * Draws the current point
     * @param ctx The canvas rendering context.
     */
    draw(ctx) {
        // Creates a circle
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.closePath();
        ctx.fill();
    }
    /** Updates poistion of current boid
     * @param dt The difference, in milliseconds, since last update
     * @param neighbors An array of neighbor boids
     *
     */
    update(dt, neighbors) {
        const { closeDist } = this.canvasOpts;
        // Separate from close neighbors
        this.separate(neighbors.filter(boid => dist(this, boid) < closeDist));
        // Align with neighbors
        this.align(neighbors);
        // Cohere with neighbors
        this.cohere(neighbors);
        // Avoid walls
        this.avoidWalls();
        // Clamp between min and max speed
        this.clampSpeed();
        const timeFactor = dt / 1000;
        const [dx, dy] = [this.vx * timeFactor, this.vy * timeFactor];
        if (!this.isCollided(dx, dy)) {
            this.x += dx;
            this.y += dy;
        }
    }
    // Returns true if boid has collided with canvas walls
    // will also set position to just have bounced off of wall if 
    // collided
    // NOTE: Probably should set value to where it would be if it 
    // had collided
    isCollided(dx, dy) {
        const { width, height } = this.canvasOpts;
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
            collided = true;
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
    avoidWalls() {
        const { width, height, buffer, avoidFactor } = this.canvasOpts;
        let [dx, dy] = [0, 0];
        if (this.x - 0 < buffer) {
            dx = this.x - 0;
        }
        if (width - this.x < buffer) {
            dx = this.x - width;
        }
        if (this.y - 0 < buffer) {
            dy = this.y - 0;
        }
        if (height - this.y < buffer) {
            dy = this.y - height;
        }
        this.vx += dx * avoidFactor;
        this.vy += dy * avoidFactor;
    }
    separate(closeNeighbors) {
        let [dx, dy] = [0, 0];
        const { avoidFactor } = this.canvasOpts;
        for (let i = 0; i < closeNeighbors.length; i++) {
            dx += this.x - closeNeighbors[i].x;
            dy += this.y - closeNeighbors[i].y;
        }
        this.vx += dx * avoidFactor;
        this.vy += dy * avoidFactor;
    }
    align(neighbors) {
        let [vx_avg, vy_avg, n] = [0, 0, 0];
        const { alignFactor } = this.canvasOpts;
        for (let i = 0; i < neighbors.length; i++) {
            vx_avg += neighbors[i].vx;
            vy_avg += neighbors[i].vy;
            n++;
        }
        if (n > 0) {
            vx_avg = vx_avg / n;
            vy_avg = vy_avg / n;
        }
        this.vx += (vx_avg - this.vx) * alignFactor;
        this.vy += (vy_avg - this.vy) * alignFactor;
    }
    cohere(neighbors) {
        let [px_avg, py_avg, n] = [0, 0, 0];
        const { cohereFactor } = this.canvasOpts;
        for (let i = 0; i < neighbors.length; i++) {
            px_avg += neighbors[i].x;
            py_avg += neighbors[i].y;
            n++;
        }
        if (n > 0) {
            px_avg = px_avg / n;
            py_avg = py_avg / n;
        }
        this.vx += (px_avg - this.x) * cohereFactor;
        this.vy += (py_avg - this.y) * cohereFactor;
    }
    // Clamps speed to limits
    clampSpeed() {
        const { maxSpeed, minSpeed } = this.canvasOpts;
        const speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }
        if (speed < minSpeed) {
            this.vx = (this.vx / speed) * minSpeed;
            this.vy = (this.vy / speed) * minSpeed;
        }
    }
}
/** Returns the Euclidean distance between two points in 2D space
 * @param p1 A 2D Cartesian point {x, y}
 * @param p2 A 2D Cartesian point {x, y}
 * @return The distance (in same units as input) between p1 and p2
 */
function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
class BoidContainer {
    constructor(canvas, n = 30, defaultBoidOpts = { size: 5 }) {
        const { avoidFactor, alignFactor, cohereFactor, neighborDist, closeDist, minSpeed, maxSpeed, buffer } = defaultCanvasOpts;
        if (canvas === null) {
            throw 'Canvas element is null';
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw 'Browser does not support 2D canvas context';
        }
        this.canvas = canvas;
        this.ctx = ctx;
        this.boids = [];
        this.n = n;
        this.canvasOpts = {
            width: canvas.width,
            height: canvas.height,
            avoidFactor: avoidFactor,
            alignFactor: alignFactor,
            cohereFactor: cohereFactor,
            neighborDist: neighborDist,
            closeDist: closeDist,
            buffer: buffer,
            minSpeed: minSpeed,
            maxSpeed: maxSpeed
        };
        this.defaultBoidOpts = defaultBoidOpts;
        this.running = false;
    }
    init() {
        // Reset canvas, if anything is currently there
        //
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.stroke();
        // Clear boids, if they are there
        this.boids = [];
        // Create n boids
        for (let i = 0; i < this.n; i++) {
            const boid = new Boid(Math.random() * (this.canvasOpts.width - 20) + 10, Math.random() * (this.canvasOpts.height - 20) + 10, this.canvasOpts, Object.assign(Object.assign({}, this.defaultBoidOpts), { vx: Math.random() * 2 * this.canvasOpts.maxSpeed - this.canvasOpts.maxSpeed, vy: Math.random() * 2 * this.canvasOpts.maxSpeed - this.canvasOpts.maxSpeed }));
            this.boids.push(boid);
            boid.draw(this.ctx);
        }
    }
    step(timestamp) {
        if (this.previousTimestamp === undefined) {
            this.previousTimestamp = timestamp;
        }
        const dt = timestamp - this.previousTimestamp; // dt in milliseconds
        this.ctx.beginPath();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.stroke();
        this.boids.forEach(boid => {
            const neighbors = this.boids.filter(neighbor => neighbor !== boid && (dist(boid, neighbor) < this.canvasOpts.neighborDist));
            boid.update(dt, neighbors);
            boid.draw(this.ctx);
        });
        this.previousTimestamp = timestamp;
        if (this.running) {
            window.requestAnimationFrame(this.step.bind(this));
        }
    }
    start() {
        this.running = true;
        window.requestAnimationFrame(this.step.bind(this));
    }
    stop() {
        this.running = false;
    }
    setCanvasOpts(opts) {
        this.canvasOpts = Object.assign(this.canvasOpts, opts);
    }
    setBoidOpts(opts) {
        this.boids.forEach(boid => boid.setOpts(opts));
    }
}
function createCanvasOptsHandler(boidContainer, key) {
    return (e) => {
        const target = e.target;
        const val = target.value;
        if (val) {
            const opts = {};
            opts[key] = parseFloat(val) / 50 * defaultCanvasOpts[key];
            boidContainer.setCanvasOpts(opts);
        }
    };
}
// Intialize canvas and run animation
window.onload = () => {
    var _a, _b, _c, _d, _e, _f;
    const boidContainer = new BoidContainer(document.getElementById('canvas'));
    boidContainer.init();
    boidContainer.start();
    (_a = document.querySelector('input[name="size"]')) === null || _a === void 0 ? void 0 : _a.addEventListener("change", (e) => {
        const target = e.target;
        const val = target.value;
        boidContainer.setBoidOpts({ size: parseFloat(val) });
    });
    (_b = document.querySelector('input[name="cohereFactor"]')) === null || _b === void 0 ? void 0 : _b.addEventListener("change", createCanvasOptsHandler(boidContainer, "cohereFactor"));
    (_c = document.querySelector('input[name="alignFactor"]')) === null || _c === void 0 ? void 0 : _c.addEventListener("change", createCanvasOptsHandler(boidContainer, "alignFactor"));
    (_d = document.querySelector('input[name="avoidFactor"]')) === null || _d === void 0 ? void 0 : _d.addEventListener("change", createCanvasOptsHandler(boidContainer, "avoidFactor"));
    (_e = document.querySelector('input[name="minSpeed"]')) === null || _e === void 0 ? void 0 : _e.addEventListener("change", createCanvasOptsHandler(boidContainer, "minSpeed"));
    (_f = document.querySelector('input[name="maxSpeed"]')) === null || _f === void 0 ? void 0 : _f.addEventListener("change", createCanvasOptsHandler(boidContainer, "maxSpeed"));
};
