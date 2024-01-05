// Globals
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var x = 0;
var y = Math.floor(canvas.height / 2);
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
    Boid.prototype.update = function (dt) {
        var _a = this.canvasOpts, width = _a.width, height = _a.height;
        if ((this.x + this.vx - this.size) < 0 || (this.x + this.vx + this.size) > width) {
            this.vx = -1 * this.vx;
        }
        if ((this.y + this.vy - this.size) < 0 || (this.y + this.vy + this.size) > height) {
            this.vy = -1 * this.vy;
        }
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;
    };
    return Boid;
}());
var boids = [];
/**
 * Initializes the canvas. Should only run on page load.
 */
function init() {
    if (canvas == null || ctx == null)
        return;
    // Create 10 boids
    for (var i = 0; i < 10; i++) {
        var boid = new Boid(Math.random() * canvas.width - 10, Math.random() * canvas.height - 10, { width: canvas.width, height: canvas.height }, { vx: Math.random() * 100 - 50, vy: Math.random() * 100 - 50 });
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if (previousTimestamp === undefined) {
        previousTimestamp = timestamp;
    }
    var dt = timestamp - previousTimestamp; // dt in milliseconds
    boids.forEach(function (boid) {
        boid.update(dt);
        boid.draw(ctx);
    });
    previousTimestamp = timestamp;
    window.requestAnimationFrame(step);
}
window.onload = function () {
    init();
    window.requestAnimationFrame(step);
};
