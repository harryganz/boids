// Globals
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var x = 0;
var y = Math.floor(canvas.height / 2);
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
