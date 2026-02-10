class MagnetLines {
    constructor(options) {
        this.container = options.container || document.body;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.rows = options.rows || 15;
        this.cols = options.cols || 20;  
        this.lineLength = options.lineLength || 20;
        this.lineColor = options.lineColor || 'rgba(46, 125, 50, 0.4)';  
        this.lineWidth = options.lineWidth || 2;
        this.mouse = { x: 0, y: 0 };
        this.lines = [];
        this.init();
    }
    init() {
        this.canvas.style.position='fixed';
        this.canvas.style.top='0';
        this.canvas.style.left='0';
        this.canvas.style.width='100%';
        this.canvas.style.height='100%';
        this.canvas.style.zIndex='-1';  
        this.canvas.style.background='#050505';  
        this.container.appendChild(this.canvas);
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        this.resize();
        this.animate();
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createGrid();
    }
    createGrid() {
        this.lines = [];
        const xStep = this.canvas.width / this.cols;
        const yStep = this.canvas.height / this.rows;
        for (let r = 0; r <this.rows; r++) {
            for (let c = 0; c <this.cols; c++) {
                this.lines.push({
                    x: c * xStep + xStep / 2,
                    y: r * yStep + yStep / 2
                });
            }
        }
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.lines.forEach(line => {
            const dx = this.mouse.x-line.x;
            const dy = this.mouse.y-line.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            this.ctx.save();
            this.ctx.translate(line.x, line.y);
            this.ctx.rotate(angle);
            this.ctx.beginPath();
            this.ctx.moveTo(-this.lineLength / 2, 0);
            this.ctx.lineTo(this.lineLength / 2, 0);
            this.ctx.strokeStyle = this.lineColor;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.stroke();
            this.ctx.restore();
        });
        requestAnimationFrame(() => this.animate());
    }
}