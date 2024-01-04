// Globals
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var avoidFactor = 0.1;
var matchingFactor = 0.1;
var centeringFactor = 0.01;
var avoidDist = 10;
var maxSpeed = 50;
var minSpeed = 5;
var x = 0;
var y = Math.floor(canvas.height / 2);
var Boid = /** @class */ (function () {
    function Boid(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }
    Boid.prototype.update = function (neighbors) {
        this.separate(neighbors);
        this.align(neighbors);
        this.cohere(neighbors);
        // Clamp speed
        var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }
        if (speed < minSpeed) {
            this.vx = (this.vx / speed) * minSpeed;
            this.vy = (this.vy / speed) * minSpeed;
        }
        this.x += this.vx;
        this.y += this.vy;
    };
    Boid.prototype.separate = function (neighbors) {
        var _this = this;
        var close_dx = 0;
        var close_dy = 0;
        neighbors.filter(function (neighbor) { return dist(_this.x, neighbor.x, _this.y, neighbor.y) < avoidDist; }).forEach(function (neighbor) {
            close_dx += _this.x - neighbor.x;
            close_dy += _this.y - neighbor.y;
        });
        this.vx += close_dx * avoidFactor;
        this.vy += close_dy * avoidFactor;
    };
    Boid.prototype.align = function (neighbors) {
        var _a = [0, 0, 0], xvel_avg = _a[0], yvel_avg = _a[1], neighbor_cnt = _a[2];
        neighbors.forEach(function (neighbor) {
            xvel_avg += neighbor.vx;
            yvel_avg += neighbor.vy;
            neighbor_cnt += 1;
        });
        if (neighbor_cnt > 0) {
            xvel_avg = xvel_avg / neighbor_cnt;
            yvel_avg = yvel_avg / neighbor_cnt;
        }
        this.vx += (xvel_avg - this.vx) * matchingFactor;
        this.vy = (yvel_avg - this.vy) * matchingFactor;
    };
    Boid.prototype.cohere = function (neighbors) {
        var _a = [0, 0, 0], xpos_avg = _a[0], ypos_avg = _a[1], neighbor_cnt = _a[2];
        neighbors.forEach(function (neighbor) {
            xpos_avg += neighbor.x;
            ypos_avg += neighbor.y;
            neighbor_cnt += 1;
        });
        if (neighbor_cnt > 0) {
            xpos_avg = xpos_avg / neighbor_cnt;
            ypos_avg = ypos_avg / neighbor_cnt;
        }
        this.vx += (xpos_avg - this.x) * centeringFactor;
        this.vy += (ypos_avg - this.y) * centeringFactor;
    };
    return Boid;
}());
function dist(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
/**
 * Initializes the canvas. Should only run on page load.
 */
function init() {
    if (ctx != null) {
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
}
var previousTimestamp;
/** Creates a step of animation
 */
function step(timestamp) {
    if (previousTimestamp === undefined) {
        previousTimestamp = timestamp;
    }
    var dt = timestamp - previousTimestamp; // dt in milliseconds
    // Set x velocity to 30px per second
    var dx = 30 * dt / 1000;
    x += dx;
    if (x < canvas.width) {
        window.requestAnimationFrame(step);
    }
}
window.onload = function () {
    init();
    window.requestAnimationFrame(step);
};
