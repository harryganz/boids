var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Globals
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var avoidFactorInput = document.getElementById('avoid-factor-input');
var Boid = /** @class */ (function () {
    /**
     * Boid represents a "bird like object" that engages in flocking behavior with other boids.
     */
    function Boid(x, y, canvasOpts, opts) {
        var _a = opts || {}, vx = _a.vx, vy = _a.vy, size = _a.size, color = _a.color;
        this.x = x;
        this.y = y;
        this.canvasOpts = canvasOpts;
        this.vx = vx || 0;
        this.vy = vy || 0;
        this.size = size || 5;
        this.color = color || "#000000";
    }
    /**
     * Draws the current point
     * @param ctx The canvas rendering context.
     */
    Boid.prototype.draw = function (ctx) {
        // Creates a circle
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.closePath();
        ctx.fill();
    };
    /** Updates poistion of current boid
     * @param dt The difference, in milliseconds, since last update
     * @param neighbors An array of neighbor boids
     *
     */
    Boid.prototype.update = function (dt, neighbors) {
        var _this = this;
        var closeDist = this.canvasOpts.closeDist;
        // Separate from close neighbors
        this.separate(neighbors.filter(function (boid) { return dist(_this, boid) < closeDist; }));
        // Align with neighbors
        this.align(neighbors);
        // Cohere with neighbors
        this.cohere(neighbors);
        // Avoid walls
        this.avoidWalls();
        // Clamp between min and max speed
        this.clampSpeed();
        var timeFactor = dt / 1000;
        var _a = [this.vx * timeFactor, this.vy * timeFactor], dx = _a[0], dy = _a[1];
        if (!this.isCollided(dx, dy)) {
            this.x += dx;
            this.y += dy;
        }
    };
    // Returns true if boid has collided with canvas walls
    // will also set position to just have bounced off of wall if 
    // collided
    // NOTE: Probably should set value to where it would be if it 
    // had collided
    Boid.prototype.isCollided = function (dx, dy) {
        var width = canvasOpts.width, height = canvasOpts.height;
        var collided = false;
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
    };
    Boid.prototype.avoidWalls = function () {
        var _a = this.canvasOpts, width = _a.width, height = _a.height, buffer = _a.buffer, avoidFactor = _a.avoidFactor;
        var _b = [0, 0], dx = _b[0], dy = _b[1];
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
    };
    Boid.prototype.separate = function (closeNeighbors) {
        var _a = [0, 0], dx = _a[0], dy = _a[1];
        var avoidFactor = this.canvasOpts.avoidFactor;
        for (var i = 0; i < closeNeighbors.length; i++) {
            dx += this.x - closeNeighbors[i].x;
            dy += this.y - closeNeighbors[i].y;
        }
        this.vx += dx * avoidFactor;
        this.vy += dy * avoidFactor;
    };
    Boid.prototype.align = function (neighbors) {
        var _a = [0, 0, 0], vx_avg = _a[0], vy_avg = _a[1], n = _a[2];
        var alignFactor = this.canvasOpts.alignFactor;
        for (var i = 0; i < neighbors.length; i++) {
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
    };
    Boid.prototype.cohere = function (neighbors) {
        var _a = [0, 0, 0], px_avg = _a[0], py_avg = _a[1], n = _a[2];
        var cohereFactor = this.canvasOpts.cohereFactor;
        for (var i = 0; i < neighbors.length; i++) {
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
    };
    // Clamps speed to limits
    Boid.prototype.clampSpeed = function () {
        var _a = this.canvasOpts, maxSpeed = _a.maxSpeed, minSpeed = _a.minSpeed;
        var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }
        if (speed < minSpeed) {
            this.vx = (this.vx / speed) * minSpeed;
            this.vy = (this.vy / speed) * minSpeed;
        }
    };
    return Boid;
}());
/** Returns the Euclidean distance between two points in 2D space
 * @param p1 A 2D Cartesian point {x, y}
 * @param p2 A 2D Cartesian point {x, y}
 * @return The distance (in same units as input) between p1 and p2
 */
function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
// boid list global object
// and global canvas options
var boids = [];
var canvasOpts = { width: canvas.width, height: canvas.height, avoidFactor: parseFloat(avoidFactorInput === null || avoidFactorInput === void 0 ? void 0 : avoidFactorInput.value) / 100 * 0.5 || 0.05, alignFactor: 0.01, cohereFactor: 0.01, neighborDist: 100, closeDist: 30, buffer: 55, minSpeed: 30, maxSpeed: 50 };
var boidOpts = { size: 5 };
/**
 * Initializes the canvas. Should only run on page load.
 */
function init() {
    if (canvas == null || ctx == null)
        return;
    // Create 10 boids
    for (var i = 0; i < 20; i++) {
        var boid = new Boid(Math.random() * (canvas.width - 20) + 10, Math.random() * (canvas.height - 20) + 10, canvasOpts, __assign(__assign({}, boidOpts), { vx: Math.random() * 2 * canvasOpts.maxSpeed - canvasOpts.maxSpeed, vy: Math.random() * 2 * canvasOpts.maxSpeed - canvasOpts.maxSpeed }));
        boids.push(boid);
        boid.draw(ctx);
    }
}
var previousTimestamp;
/** Creates a step of animation. Will request another animation frame when done with current step.
 * @param timestamp The current animation timestamp in milliseconds
 */
function step(timestamp) {
    if (ctx == null)
        return;
    if (previousTimestamp === undefined) {
        previousTimestamp = timestamp;
    }
    var dt = timestamp - previousTimestamp; // dt in milliseconds
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    boids.forEach(function (boid) {
        var neighbors = boids.filter(function (neighbor) { return neighbor !== boid && (dist(boid, neighbor) < canvasOpts.neighborDist); });
        boid.update(dt, neighbors);
        boid.draw(ctx);
    });
    previousTimestamp = timestamp;
    window.requestAnimationFrame(step);
}
// Set listeners for inputs
avoidFactorInput === null || avoidFactorInput === void 0 ? void 0 : avoidFactorInput.addEventListener('change', function () {
    var val = avoidFactorInput.value;
    if (val) {
        canvasOpts.avoidFactor = parseFloat(val) / 100 * 0.5;
    }
});
// Intialize canvas and run animation
window.onload = function () {
    init();
    window.requestAnimationFrame(step);
};
