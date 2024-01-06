// Globals
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var Boid = /** @class */ (function () {
    function Boid(x, y, canvasOpts, opts) {
        var _a = opts || {}, vx = _a.vx, vy = _a.vy, size = _a.size, color = _a.color;
        this.x = x;
        this.y = y;
        this.canvasOpts = canvasOpts;
        this.vx = vx || 0;
        this.vy = vy || 0;
        this.size = size || 10;
        this.color = color || "#000000";
    }
    Boid.prototype.draw = function (ctx) {
        // Creates a circle
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.closePath();
        ctx.fill();
    };
    Boid.prototype.update = function (dt, neighbors) {
        var _this = this;
        var _a = this.canvasOpts, width = _a.width, height = _a.height, closeDist = _a.closeDist;
        this.separate(neighbors.filter(function (boid) { return dist(_this, boid) < closeDist; }));
        var timeFactor = dt / 1000;
        if (!this.isCollided(width, height, this.vx * timeFactor, this.vy * timeFactor)) {
            this.x += this.vx * dt / 1000;
            this.y += this.vy * dt / 1000;
        }
    };
    // Returns true if boid has collided with canvas walls
    // will also set position to just have bounced off of wall if 
    // collided
    // NOTE: Probably should set value to where it would be if it 
    // had collided
    Boid.prototype.isCollided = function (width, height, dx, dy) {
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
    return Boid;
}());
function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
var boids = [];
var canvasOpts = { width: canvas.width, height: canvas.height, avoidFactor: 0.1, neighborDist: 100, closeDist: 50 };
/**
 * Initializes the canvas. Should only run on page load.
 */
function init() {
    if (canvas == null || ctx == null)
        return;
    // Create 10 boids
    for (var i = 0; i < 10; i++) {
        var boid = new Boid(Math.random() * (canvas.width - 20) + 10, Math.random() * (canvas.height - 20) + 10, canvasOpts, { vx: Math.random() * 400 - 200, vy: Math.random() * 400 - 200 });
        boids.push(boid);
        boid.draw(ctx);
    }
}
var previousTimestamp;
/** Creates a step of animation
 */
function step(timestamp) {
    if (ctx == null)
        return;
    if (previousTimestamp === undefined) {
        previousTimestamp = timestamp;
    }
    var dt = timestamp - previousTimestamp; // dt in milliseconds
    // Skip animation if longer than 0.3s, implies 
    // tab was closed
    if (dt < 100) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        boids.forEach(function (boid) {
            var neighbors = boids.filter(function (neighbor) { return dist(boid, neighbor) < canvasOpts.neighborDist; });
            boid.update(dt, neighbors);
            boid.draw(ctx);
        });
    }
    previousTimestamp = timestamp;
    window.requestAnimationFrame(step);
}
window.onload = function () {
    init();
    window.requestAnimationFrame(step);
};
