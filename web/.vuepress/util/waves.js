// Waves for homepage hero section

/**
 * @param  canvas
 */
function Waves(canvas) {
    const ctx = canvas.getContext('2d');
    const parentRect = canvas.parentNode.getBoundingClientRect();
    const height = canvas.height = parentRect.height * 0.66;
    const width = canvas.width = Math.min(parentRect.width + 300, window.innerWidth - 400);

    // Stage
    const fov = 1024;
    const zRows = width / 60;
    const xRows = width / 25;
    const yBase = 800;
    const spacing = width / xRows;
    const dotSize = 1.25;
    const tickDiv = 25;
    let tick = 0;
    let isStop = false;

    // Points
    const points = [];

    for (let z = 0; z < zRows; z++) {
        for (let x = -xRows / 2; x < xRows / 2; x++) {
            points.push(new Point({
                x: x * spacing + dotSize,
                y: yBase,
                z: z * spacing,
                yRange: 20,
                tickOffset: (z * 7) + (x * 5),
            }));
        }
    }

    /**
     * @param  config
     */
    function Point(config) {
        for (const key in config) this[key] = config[key];
    }

    Point.prototype.update = function () {
        const z2d = fov / (this.z + fov);

        this.yFloat = this.yRange * Math.sin((tick + this.tickOffset) / tickDiv);
        this.distance = (this.z / spacing) / zRows;
        this.x2d = (this.x * z2d) + (width / 2);
        this.y2d = (this.y * z2d) + (height / 2) - (this.y * 0.7) + this.yFloat;
        this.dotSize = dotSize * (1 - this.distance);
        this.alpha = 1 * (1 - this.distance);
    };

    Point.prototype.drawDot = function () {
        ctx.beginPath();
        ctx.arc(this.x2d, this.y2d, this.dotSize, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(9,26,233,${this.alpha})`;
        ctx.fill();
    };

    /**
     */
    function animate() {
        if (isStop) return;
        ++tick;
        ctx.clearRect(0, 0, width, height);

        points.forEach((point, i) => {
            point.update();
            point.drawDot();
        });

        requestAnimationFrame(animate);
    }

    /**
     */
    function stop() {
        isStop = true;
    }

    return {
        run: animate,
        stop,
    };
}

module.exports = Waves;
