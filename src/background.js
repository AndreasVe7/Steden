class WeatherParticle {
    constructor(canvas, temp) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        
        // Kleur gebaseerd op temperatuur
        this.temp = temp;
        this.color = this.getColorFromTemp(temp);
    }

    getColorFromTemp(temp) {
        if (temp < 0) return '#A5F2F3';    // IJskoud - lichtblauw
        if (temp < 10) return '#4287f5';   // Koud - blauw
        if (temp < 20) return '#42f54b';   // Gematigd - groen
        if (temp < 30) return '#f5b042';   // Warm - oranje
        return '#f54242';                  // Heet - rood
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce effect op randen
        if (this.x > this.canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > this.canvas.height || this.y < 0) this.speedY *= -1;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

export class WeatherBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-2';
        document.body.appendChild(this.canvas);

        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateParticles(temperature) {
        // Reset particles met nieuwe temperatuur
        this.particles = [];
        for (let i = 0; i < 100; i++) {
            this.particles.push(new WeatherParticle(this.canvas, temperature));
        }
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(() => this.animate());
    }
}