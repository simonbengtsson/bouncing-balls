var canvas;
var ctx;

$(document).ready(function () {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    var world = new World();
    setInterval(world.update, 5); // World should update every 5 ms
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Ball model
 */
function Ball(color) {

    const RADIUS = 20;
    const MASS = 20;
    const INIT_SPEED_X = 0;
    const INIT_SPEED_Y = 2;
    const GRAVITY = 0.07;

    // Initialize
    this.color = color;
    this.mass = MASS;
    this.radius = RADIUS;
    this.x = Math.floor(Math.random() * canvas.width);
    this.y = Math.floor(Math.random() * canvas.height);
    this.nextX = this.x;
    this.nextY = this.y;
    this.speedX = INIT_SPEED_X;
    this.speedY = INIT_SPEED_Y;

    /**
     * Updates potential next position from speed
     */
    this.update = function () {
        this.speedY += GRAVITY;
        this.x += this.speedX;
        this.y += this.speedY;
        this.nextX = this.x;
        this.nextY = this.y;
    };

    /**
     * Check and update ball position if wall collision
     */
    this.wallCollision = function () {

        // Top
        if (this.nextX - this.radius < 0) {
            this.speedX *= -1;
            this.nextX = this.radius;
        }

        // Right
        else if (this.nextX + this.radius > canvas.width) {
            this.speedX *= -1;
            this.nextX = canvas.width - this.radius;
        }

        // Bottom
        else if (this.nextY + this.radius > canvas.height) {
            this.speedY *= -1;
            this.nextY = canvas.height - this.radius;
        }

        // Left
        else if (this.nextY - this.radius < 0) {
            this.speedY *= -1;
            this.nextY = this.radius;
        }

    };

    /**
     * Draw ball to canvas
     */
    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
}

/**
 * World model
 */
function World() {

    const BALL_COUNT = 5;

    var balls = [];

    // Create and place balls. Only add if they don't overlap any other
    for (var i = 0; i < BALL_COUNT; i++) {
        var color = i % 2 === 0 ? '#fff' : '#000';
        balls.push(new Ball(color));
    }

    /**
     * Check if the specified ball overlaps any other
     * @param ball
     * @returns {boolean}
     */
    function isOverlap(ball) {
        for (var i = 0; i < balls.length; i++) {
            if (ball.collision(balls[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * All world updates through here
     */
    this.update = function () {
        resizeCanvas();
        //ballCollisions();
        balls.forEach(function (ball) {
            ball.update();
            ball.wallCollision();
        });
        balls.forEach(function (ball) {
            ball.draw();
        });
    };
}