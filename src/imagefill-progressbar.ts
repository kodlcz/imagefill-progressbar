import { easingFunctions, isElement } from './utils';
import { ImageFillProgressBarConfig } from './ImageFillProgressBarConfig';

export class ImageFillProgressBar {
  private readonly ratio = window.devicePixelRatio || 1;
  private readonly browserRefreshRate = 1000 / 60;
  private readonly config: ImageFillProgressBarConfig = {
    animationDurationMs: 1000,
    onComplete: () => {},
    easingFunction: easingFunctions.easeOutQuint,
    showNumericDisplay: true,
    numericDisplayFormatter: (val: number) => Math.floor(val).toString(),
    backgroundSrc: null,
    foregroundSrc: null,
    container: ''
  };

  private currentX = 0;
  private progress = 0;
  private previousProgress = 0;
  private requestAnimationId: number = null;
  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private container: HTMLElement;
  private numericDisplay: HTMLElement;
  private numericDisplayWrapper: HTMLElement;
  private iterationCount: number;
  private width: number;
  private height: number;
  private foreground: HTMLImageElement;
  private background: HTMLImageElement;
  private template = `
    <section class="imagefill-progressbar"
             style="
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
             ">
        <canvas></canvas>
        <div class="numeric-display-wrapper" style="text-align: center">
            <div class="numeric-display"></div>
        </div>
    </section>
  `;

  private get imageSize() {
    return {
      imageWidth: this.foreground.width,
      imageHeight: this.foreground.height
    };
  }

  constructor(config = {}) {
    this.config = Object.assign({}, this.config, config);
  }

  public update(progress: number) {
    this.previousProgress = this.progress;
    this.progress = progress;
    window.cancelAnimationFrame(this.requestAnimationId);
    this.animate();
  }

  async init(): Promise<void> {
    const { config } = this;
    this.iterationCount = Math.floor(
      config.animationDurationMs / this.browserRefreshRate
    );

    this.setContainer();
    this.setCanvas();
    this.setNumericDisplay();
    await this.loadImages();
    this.registerResizehandler();
    this.updateCanvasSize();
    this.animate();
  }

  private resize() {
    this.updateCanvasSize();
    this.drawFrame(this.currentX);
  }

  private updateCanvasSize() {
    const { canvas, canvasContext, ratio, currentX } = this;
    const { targetWidth, targetHeight } = this.getTargetSize();
    const { imageWidth, imageHeight } = this.imageSize;
    const scale = this.getScale(targetWidth, targetHeight);

    this.width = scale * imageWidth;
    this.height = scale * imageHeight;

    this.currentX = currentX > 0 ? (currentX / this.width) * targetWidth : 0;

    canvas.width = this.width * ratio;
    canvas.height = this.height * ratio;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    canvasContext.scale(ratio, ratio);
  }

  private animate() {
    const { progress, width, step, currentX } = this;
    const targetX = (progress * width) / 100 - currentX;
    this.requestAnimationId = window.requestAnimationFrame(
      step.bind(this, currentX, 0, targetX)
    );
  }

  private step(offset: number, currentIteration: number, targetX: number) {
    const { config, drawFrame, iterationCount, step, width } = this;
    const changePercent = currentIteration / iterationCount;
    let x = config.easingFunction(changePercent) * targetX;
    x += offset;
    drawFrame.call(this, x);
    this.currentX = x;
    currentIteration++;

    const numericChange =
      (this.progress - this.previousProgress) * changePercent +
      this.previousProgress;

    this.updateNumericDisplay(numericChange);

    if (currentIteration <= iterationCount) {
      this.requestAnimationId = window.requestAnimationFrame(
        step.bind(this, offset, currentIteration, targetX)
      );
    }

    if (x === width) {
      config.onComplete();
    }
  }

  private drawFrame(x: number) {
    const { canvasContext, width, height, foreground, background } = this;
    const { imageWidth, imageHeight } = this.imageSize;

    canvasContext.clearRect(0, 0, width, height);
    const offset = x * (imageWidth / width);
    canvasContext.drawImage(
      foreground,
      0,
      0,
      offset,
      imageHeight,
      0,
      0,
      x,
      height
    );

    canvasContext.drawImage(
      background,
      offset,
      0,
      imageWidth,
      imageHeight,
      x,
      0,
      width,
      height
    );
  }

  private updateNumericDisplay(value: number) {
    const { config, numericDisplay } = this;
    if (config.showNumericDisplay) {
      numericDisplay.innerHTML = config.numericDisplayFormatter(value);
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    if (!src) {
      throw new Error('[ImageFillProgressBar] Invalid image source');
    }

    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = src;
    });
  }

  private getTargetSize() {
    const containerBB = this.container.getBoundingClientRect();

    let targetHeight = containerBB.height;
    const targetWidth = containerBB.width;

    if (this.config.showNumericDisplay) {
      const numericDisplayBB = this.numericDisplayWrapper.getBoundingClientRect();
      targetHeight = containerBB.height - numericDisplayBB.height;
    }

    return {
      targetHeight,
      targetWidth
    };
  }

  private getScale(targetWidth: number, targetHeight: number) {
    const { imageWidth, imageHeight } = this.imageSize;
    const vertScale = targetHeight / imageHeight;
    const horizScale = targetWidth / imageWidth;

    return Math.min(vertScale, horizScale);
  }

  private resolveContainer(): HTMLElement {
    const { container } = this.config;
    const resolvedContainer: HTMLElement =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!isElement(resolvedContainer)) {
      throw new Error('[ImageFillProgressBar] Invalid container');
    }

    return resolvedContainer;
  }

  private cleanUp() {
    window.removeEventListener('resize', this.resize);
  }

  private setCanvas() {
    this.canvas = this.container.querySelector('canvas');
    this.canvasContext = this.canvas.getContext('2d');
  }

  private setContainer() {
    this.container = this.resolveContainer();
    this.container.innerHTML = this.template;
  }

  private setNumericDisplay() {
    const { config } = this;
    this.numericDisplay = this.container.querySelector('.numeric-display');
    this.numericDisplayWrapper = this.container.querySelector(
      '.numeric-display-wrapper'
    );
    this.numericDisplayWrapper.style.display = config.showNumericDisplay
      ? 'block'
      : 'none';
    this.updateNumericDisplay(this.progress);
  }

  private async loadImages() {
    const { loadImage, config } = this;
    this.foreground = await loadImage(config.foregroundSrc);
    this.background = await loadImage(config.backgroundSrc);
  }

  private registerResizehandler() {
    window.addEventListener('resize', this.resize.bind(this));
  }
}
