import { easingFunctions, isElement } from './utils';

class ImageFillProgressBar {
  private readonly ratio = window.devicePixelRatio || 1;
  private readonly browserRefreshRate = 1000 / 60;
  private readonly config: any = {
    animationDuration: 1000,
    onComplete: () => {},
    easingFunction: easingFunctions.easeOutQuint,
    showNumericDisplay: true,
    background: '',
    foreground: ''
  };

  private progress = 0;
  private currentX = 0;
  private requestAnimationId: number = null;
  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private imagefillProgressbar: HTMLElement;
  private iterationCount: number;
  private width: number;
  private height: number;
  private foreground: HTMLImageElement;
  private background: HTMLImageElement;

  constructor(config = {}) {
    this.config = Object.assign({}, this.config, config);
  }

  public update(progress: number) {
    this.progress = progress;
    window.cancelAnimationFrame(this.requestAnimationId);
    this.animate()
  }

  async init(selector: string | Element) {
    this.iterationCount = Math.floor(this.config.animationDuration / this.browserRefreshRate);

    // can recieve an element or a css selector
    const container = typeof selector === 'string' ?
      document.querySelector<HTMLElement>(selector) : selector;

    this.imagefillProgressbar = document.createElement('section');
    this.imagefillProgressbar.classList.add('imagefill-progressbar');
    this.canvas = document.createElement('canvas');
    this.canvasContext = this.canvas.getContext('2d');
    this.imagefillProgressbar.appendChild(this.canvas);
    container.appendChild(this.imagefillProgressbar);

    window.addEventListener('resize', this.resize.bind(this));
    this.foreground = await this.loadImage(this.config.foreground);
    this.background = await this.loadImage(this.config.background);

    this.updateCanvasSize();
    this.animate();
  }

  private resize() {
    this.updateCanvasSize();
    this.drawFrame(this.currentX);
  }

  private updateCanvasSize() {
    if (!this.config.width && !this.config.height) {
      const imagefillProgressbarBB = this.imagefillProgressbar.getBoundingClientRect();
      this.currentX = this.currentX > 0 ? (this.currentX / this.width) * imagefillProgressbarBB.width : 0;
      this.width = imagefillProgressbarBB.width;
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
    this.drawFrame(x);
    this.currentX = x;
    currentIteration++;

    this.updateProgressCounter();

    if (currentIteration <= this.iterationCount) {
      this.requestAnimationId = window.requestAnimationFrame(this.step.bind(this, offset, currentIteration, targetX));
    }

    if (x === this.width) {
      this.config.onComplete();
    }
  }

  private drawFrame(x: number) {
    this.canvasContext.clearRect(0, 0, this.width, this.height);
    this.canvasContext.drawImage(this.foreground,
      0, //sx
      0, //sy
      x * (this.background.width / this.width), //sWidth
      this.foreground.height, //sHeight
      0, // dx
      0, // dy
      x, // dWidth
      this.height // dHeight
    );

    this.canvasContext.drawImage(this.background,
      x * (this.background.width / this.width), // sx
      0, // sy
      this.background.width, // sWidth
      this.background.height, // sHeight
      x, // dx
      0, // dy
      this.width, // dWidth
      this.height // dHeight
    );
  }

  private updateProgressCounter() {
    // TODO: implement;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
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
