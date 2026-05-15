// Vanilla JS implementation of TextType component using GSAP
class TextType {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      texts: ['Text typing effect', 'for your websites', 'Happy coding!'],
      typingSpeed: 75,
      deletingSpeed: 30,
      pauseDuration: 1500,
      loop: true,
      showCursor: true,
      cursorCharacter: '|',
      variableSpeed: null,
      ...options
    };

    this.displayedText = '';
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.currentTextIndex = 0;
    this.timeoutId = null;
    this.isRunning = false;

    this.init();
  }

  init() {
    this.element.classList.add('text-type');
    this.contentSpan = document.createElement('span');
    this.contentSpan.className = 'text-type__content';
    this.element.appendChild(this.contentSpan);

    if (this.options.showCursor) {
      this.cursor = document.createElement('span');
      this.cursor.className = 'text-type__cursor';
      this.cursor.textContent = this.options.cursorCharacter;
      this.element.appendChild(this.cursor);

      // Animate cursor blinking
      gsap.to(this.cursor, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }

    this.start();
  }

  getRandomSpeed() {
    if (!this.options.variableSpeed) return this.options.typingSpeed;
    const { min, max } = this.options.variableSpeed;
    return Math.random() * (max - min) + min;
  }

  getCurrentText() {
    return this.options.texts[this.currentTextIndex];
  }

  type() {
    const currentText = this.getCurrentText();
    const speed = this.options.variableSpeed ? this.getRandomSpeed() : this.options.typingSpeed;

    if (this.currentCharIndex < currentText.length) {
      this.displayedText += currentText[this.currentCharIndex];
      this.contentSpan.textContent = this.displayedText;
      this.currentCharIndex++;
      this.timeoutId = setTimeout(() => this.type(), speed);
    } else {
      // Finished typing this text
      if (this.options.loop || this.currentTextIndex < this.options.texts.length - 1) {
        this.timeoutId = setTimeout(() => this.delete(), this.options.pauseDuration);
      }
    }
  }

  delete() {
    const speed = this.options.deletingSpeed;

    if (this.displayedText.length > 0) {
      this.displayedText = this.displayedText.slice(0, -1);
      this.contentSpan.textContent = this.displayedText;
      this.timeoutId = setTimeout(() => this.delete(), speed);
    } else {
      // Move to next text
      this.currentTextIndex = (this.currentTextIndex + 1) % this.options.texts.length;
      this.currentCharIndex = 0;
      this.timeoutId = setTimeout(() => this.type(), 500);
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.type();
    }
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isRunning = false;
  }

  destroy() {
    this.stop();
    if (this.cursor) {
      gsap.killTweensOf(this.cursor);
    }
    this.element.innerHTML = '';
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextType;
}
