import { easingFunctions, isElement } from './utils';
import { ImageFillProgressBarConfig } from './ImageFillProgressBarConfig';

export class ImageFillProgressBar {
  private readonly ratio = window.devicePixelRatio || 1;
  private readonly browserRefreshRate = 1000 / 60;
  private readonly config: ImageFillProgressBarConfig = {
    animationDurationMs: 1000,
    onComplete: () => {
    },
    easingFunction: easingFunctions.easeOutQuint,
    showNumericDisplay: true,
    numericDisplayFormatter: (val: number) => val.toString()
  };

  private progress = 0;
  private currentX = 0;
  private requestAnimationId: number = null;
  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private container: Element;
  private numericDisplay: HTMLElement;
  private iterationCount: number;
  private width: number;
  private height: number;
  private foreground: HTMLImageElement;
  private background: HTMLImageElement;
  private template = `
    <section class="imagefill-progressbar">
        <canvas></canvas>
        <div class="numeric-display"></div>
    </section> 
  `;

  constructor(config = {}) {
    this.config = Object.assign({}, this.config, config);
  }

  public update(progress: number) {
    this.progress = progress;
    window.cancelAnimationFrame(this.requestAnimationId);
    this.animate()
  }

  async init(selector: string | Element): Promise<void> {
    this.iterationCount = Math.floor(this.config.animationDurationMs / this.browserRefreshRate);

    this.container = this.resolveContainer(selector);
    this.container.innerHTML = this.template;
    this.canvas = this.container.querySelector('canvas');
    this.canvasContext = this.canvas.getContext('2d');
    this.numericDisplay = this.container.querySelector('.numeric-display');
    this.numericDisplay.style.display = this.config.showNumericDisplay ? 'block' : 'none';
    this.foreground = await this.loadImage(this.config.foregroundSrc);
    this.background = await this.loadImage(this.config.backgroundSrc);

    window.addEventListener('resize', this.resize.bind(this));
    this.updateCanvasSize();
    this.animate();
  }

  private resolveContainer(selector: string | Element): Element {
    const container = typeof selector === 'string' ? document.querySelector(selector) : selector;

    if (!isElement(container)) {
      throw(new Error('[ImageFillProgressBar] Invalid selector'));
    }

    return container;
  }

  private resize() {
    this.updateCanvasSize();
    this.drawFrame(this.currentX);
  }

  private updateCanvasSize() {
    if (!this.config.width && !this.config.height) {
      const containerBB = this.container.getBoundingClientRect();
      this.currentX = this.currentX > 0 ? (this.currentX / this.width) * containerBB.width : 0;
      this.width = containerBB.width;
      this.height = this.foreground.height / this.foreground.width * this.width;
    } else if (this.config.width && !this.config.height) {
      this.width = this.config.width;
      this.height = this.foreground.height / this.foreground.width * this.config.width;
    } else if (!this.config.width && this.config.height) {
      this.height = this.config.height;
      this.width = this.foreground.width / this.foreground.height * this.config.height;
    }

    this.canvas.width = this.width * this.ratio;
    this.canvas.height = this.height * this.ratio;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvasContext.scale(this.ratio, this.ratio);
  }

  private animate() {
    const targetX = ((this.progress * this.width) / 100) - this.currentX;
    this.requestAnimationId = window.requestAnimationFrame(this.step.bind(this, this.currentX, 0, targetX));
  }

  private step(offset: number, currentIteration: number, targetX: number) {
    let x = this.config.easingFunction(currentIteration / this.iterationCount) * targetX;
    x += offset;
    this.drawFrame.call(this, x);
    this.currentX = x;
    currentIteration++;

    this.updateNumericDisplay();

    if (currentIteration <= this.iterationCount) {
      this.requestAnimationId = window.requestAnimationFrame(this.step.bind(this, offset, currentIteration, targetX));
    }

    if (x === this.width) {
      this.config.onComplete();
    }
  }

  private drawFrame(x: number) {
    this.canvasContext.clearRect(0, 0, this.width, this.height);
    const offset = x * (this.background.width / this.width);
    this.canvasContext.drawImage(this.foreground,
      0, //sx
      0, //sy
      offset, //sWidth
      this.foreground.height, //sHeight
      0, // dx
      0, // dy
      x, // dWidth
      this.height // dHeight
    );

    this.canvasContext.drawImage(this.background,
      offset, // sx
      0, // sy
      this.background.width, // sWidth
      this.background.height, // sHeight
      x, // dx
      0, // dy
      this.width, // dWidth
      this.height // dHeight
    );
  }

  private updateNumericDisplay() {
    const progress = Math.round((this.currentX / this.width) * 100);
    this.numericDisplay.innerHTML = this.config.numericDisplayFormatter(progress);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    if(!src) {
      throw(new Error('[ImageFillProgressBar] Invalid image source'));
    }

    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = src;
    });
  }

  private cleanUp() {
    window.removeEventListener('resize', this.resize)
  }
}
