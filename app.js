/**
 * Bouncing balls
 */
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
resizeCanvas();
var world = new World();
setInterval(world.update, 5); // World should update every 5 ms

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Ball model
 */
function Ball(color) {

    const RADIUS = 30;
    const MASS = 20;
    const INIT_SPEED_X = 1;
    const INIT_SPEED_Y = 2;
    const GRAVITY = 0.07;

    // Initialize
    this.color = color;
    this.mass = 20 + (Math.random() * 60);
    this.radius = this.mass;
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
     * Test for collision
     *
     * @param ball
     * @returns {boolean}
     */
    this.collision = function (ball) {
        var collision = false;
        var dx = this.nextX - ball.nextX;
        var dy = this.nextY - ball.nextY;
        var distance = (dx * dx + dy * dy);
        if (distance <= (this.radius + ball.radius) * (this.radius + ball.radius)) {
            collision = true;
        }
        return collision;
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
    };

    /**
     * Updates nextX and nextY when two balls is colliding so that they bounce of each other.
     * @param ball
     */
    this.collide = function (ball) {
        var dx = this.nextX - ball.nextX;
        var dy = this.nextY - ball.nextY;
        var collisionAngle = Math.atan2(dy, dx);

        // Actual speed calculations
        var speed1 = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        var speed2 = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);

        // Angles/radians calculations
        var direction1 = Math.atan2(this.speedY, this.speedX);
        var direction2 = Math.atan2(ball.speedY, ball.speedX);

        // "Rotate" angles in preparation for momentum formula
        var rotatedVelocityX1 = speed1 * Math.cos(direction1 - collisionAngle);
        var rotatedVelocityY1 = speed1 * Math.sin(direction1 - collisionAngle);
        var rotatedVelocityX2 = speed2 * Math.cos(direction2 - collisionAngle);
        var rotatedVelocityY2 = speed2 * Math.sin(direction2 - collisionAngle);

        // Conservation of momentum formula (because of rotation, y can be used directly, but x needs some tinkering)
        var finalVelocityX1 = ((this.mass - ball.mass) * rotatedVelocityX1 + (ball.mass + ball.mass) * rotatedVelocityX2) / (this.mass + ball.mass);
        var finalVelocityX2 = ((this.mass + this.mass) * rotatedVelocityX1 + (ball.mass - this.mass) * rotatedVelocityX2) / (this.mass + ball.mass);

        // Rotate back again
        this.speedX = Math.cos(collisionAngle) * finalVelocityX1 + Math.cos(collisionAngle + Math.PI / 2) * rotatedVelocityY1;
        this.speedY = Math.sin(collisionAngle) * finalVelocityX1 + Math.sin(collisionAngle + Math.PI / 2) * rotatedVelocityY1;
        ball.speedX = Math.cos(collisionAngle) * finalVelocityX2 + Math.cos(collisionAngle + Math.PI / 2) * rotatedVelocityY2;
        ball.speedY = Math.sin(collisionAngle) * finalVelocityX2 + Math.sin(collisionAngle + Math.PI / 2) * rotatedVelocityY2;

        // Updates
        this.nextX += this.speedX;
        this.nextY += this.speedY;
        ball.nextX += ball.speedX;
        ball.nextY += ball.speedY;
    };
}

/**
 * World model
 */
function World() {

    const BALL_COUNT = 10;
    const GRAVITY = 5;

    var balls = [];

    // Create and place balls. Only add if they don't overlap any other
    for (var i = 0; i < BALL_COUNT; i++) {
        var color = i % 2 === 0 ? '#fff' : '#000';
        while (true) {
            var tmpBall = new Ball(color);
            if (!isOverlap(tmpBall)) {
                balls.push(tmpBall);
                break;
            }
        }
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
        ballCollisions();
        balls.forEach(function (ball) {
            ball.update();
            ball.wallCollision();
        });
        balls.forEach(function (ball) {
            ball.draw();
        });
    };

    /**
     * Check if any ball has collided with any other and if so update appropriately
     */
    function ballCollisions() {
        var ball;
        var testBall;
        for (var i = 0; i < balls.length; i++) {
            ball = balls[i];
            for (var j = i + 1; j < balls.length; j++) {
                testBall = balls[j];
                if (ball.collision(testBall)) {
                    ball.collide(testBall);
                }
            }
            ball.x = ball.nextX;
            ball.y = ball.nextY;
        }
    }
}