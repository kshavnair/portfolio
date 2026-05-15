// Vanilla JS implementation of GradientBlinds effect using Canvas
class GradientBlinds {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      gradientColors: ['#c9a962', '#9c6a24'],
      angle: 0,
      noise: 0.2,
      blindCount: 12,
      blindMinWidth: 50,
      spotlightRadius: 0.4,
      spotlightSoftness: 1,
      spotlightOpacity: 0.6,
      mouseDampening: 0.15,
      mirrorGradient: false,
      distortAmount: 0,
      shineDirection: 'left',
      mixBlendMode: 'overlay',
      paused: false,
      ...options
    };

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.style.position = 'relative';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.mixBlendMode = this.options.mixBlendMode;
    this.canvas.style.pointerEvents = 'none';
    this.container.appendChild(this.canvas);

    this.mousePos = { x: 0, y: 0 };
    this.mouseTarget = { x: 0, y: 0 };
    this.time = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('mouseleave', () => this.onMouseLeave());
    this.animate();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width *= dpr;
    this.canvas.height *= dpr;
    this.ctx.scale(dpr, dpr);
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouseTarget.x = e.clientX - rect.left;
    this.mouseTarget.y = e.clientY - rect.top;
  }

  onMouseLeave() {
    this.mouseTarget.x = this.canvas.width / (window.devicePixelRatio || 1) / 2;
    this.mouseTarget.y = this.canvas.height / (window.devicePixelRatio || 1) / 2;
  }

  hexToRGB(hex) {
    const c = hex.replace('#', '').padEnd(6, '0');
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    return [r, g, b];
  }

  getGradientColor(t) {
    const colors = this.options.gradientColors.map(c => this.hexToRGB(c));
    const count = Math.min(colors.length, 8);
    
    if (count === 1) {
      const rgb = colors[0];
      return `rgb(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)})`;
    }

    const scaled = t * (count - 1);
    const seg = Math.floor(scaled);
    const frac = scaled - seg;

    let c1 = colors[Math.min(seg, count - 1)];
    let c2 = colors[Math.min(seg + 1, count - 1)];

    const r = Math.round((c1[0] * (1 - frac) + c2[0] * frac) * 255);
    const g = Math.round((c1[1] * (1 - frac) + c2[1] * frac) * 255);
    const b = Math.round((c1[2] * (1 - frac) + c2[2] * frac) * 255);

    return `rgb(${r},${g},${b})`;
  }

  animate() {
    if (!this.options.paused) {
      this.update();
      this.draw();
    }
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  update() {
    const tau = Math.max(0.001, this.options.mouseDampening);
    const factor = 1 - Math.exp(-0.016 / tau);
    this.mousePos.x += (this.mouseTarget.x - this.mousePos.x) * factor;
    this.mousePos.y += (this.mouseTarget.y - this.mousePos.y) * factor;
    this.time += 0.016;
  }

  draw() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.clearRect(0, 0, w, h);

    const blindCount = this.options.blindCount;
    const blindWidth = w / blindCount;

    for (let i = 0; i < blindCount; i++) {
      const x = i * blindWidth;
      const t = i / blindCount;
      const color = this.getGradientColor(t);

      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, 0, blindWidth, h);

      // Spotlight effect
      const spotlightRadius = this.options.spotlightRadius * Math.min(w, h);
      const dx = this.mousePos.x - (x + blindWidth / 2);
      const dy = this.mousePos.y - h / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const spotlight = Math.max(0, 1 - Math.pow(dist / spotlightRadius, this.options.spotlightSoftness));

      if (spotlight > 0) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${spotlight * this.options.spotlightOpacity * 0.15})`;
        this.ctx.fillRect(x, 0, blindWidth, h);
      }

      // Shine effect
      const shineX = this.options.shineDirection === 'right' ? x + blindWidth * 0.7 : x + blindWidth * 0.3;
      const shineGradient = this.ctx.createLinearGradient(x, 0, x + blindWidth, 0);
      shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      shineGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.05 * (1 - i / blindCount)})`);
      shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      this.ctx.fillStyle = shineGradient;
      this.ctx.fillRect(x, 0, blindWidth, h);
    }

    // Add noise
    if (this.options.noise > 0) {
      const imageData = this.ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * this.options.noise * 255;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    if (this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas);
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GradientBlinds;
}
