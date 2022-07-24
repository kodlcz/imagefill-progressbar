import { easingFunctions, htmlToElement, isElement } from './utils';
import { ImageFillProgressBarConfig } from './ImageFillProgressBarConfig';
import { EasingFunction } from './easing-functions.enum';

export class ImageFillProgressBar {
  private readonly ratio = window.devicePixelRatio || 1;
  private readonly browserRefreshRate = 1000 / 60;

  private readonly config: ImageFillProgressBarConfig = {
    animationDurationMs: 1000,
    onComplete: () => {},
    easingFunction: EasingFunction.easeOutQuint,
    showNumericDisplay: true,
    numericDisplayFormatter: (val: number) => Math.floor(val).toString(),
    backgroundSrc: null,
    foregroundSrc: null,
    drawVertical: false,
    container: ''
  };

  private currentX = 0;
  private currentY = 0;
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
    this.resize = this.resize.bind(this);
  }

  /**
     Function to update the progress bar
     @param {number}progress - represents the new progress value in terms of percentage
     */
  public update(progress: number) {
    this.previousProgress = this.progress;
    this.progress = progress;
    window.cancelAnimationFrame(this.requestAnimationId);
    this.animate();
  }

  /**
     Asynchronous function to initialize the progress bar
     */
  public async init(): Promise<void> {
    const { config } = this;
    this.iterationCount = Math.floor(
      config.animationDurationMs / this.browserRefreshRate
    );

    this.setContainer();
    this.setCanvas();
    this.setNumericDisplay();
    await this.loadImages();
    this.registerResizeHandler();
    this.updateCanvasSize();
    this.animate();
  }

  /**
     Cleanup function, to call whenever removing the component from the DOM
     */
  public cleanUp() {
    window.removeEventListener('resize', this.resize);
    window.cancelAnimationFrame(this.requestAnimationId);
  }

  private resize() {
    this.updateCanvasSize();
    this.drawFrame(this.currentX, this.currentY);
  }

  private updateCanvasSize() {
    const { canvas, canvasContext, ratio, currentX, currentY } = this;
    const { targetWidth, targetHeight } = this.getTargetSize();
    const { imageWidth, imageHeight } = this.imageSize;
    const scale = this.getScale(targetWidth, targetHeight);

    this.width = scale * imageWidth;
    this.height = scale * imageHeight;

    this.currentX = currentX > 0 ? (currentX / this.width) * targetWidth : 0;
    this.currentY = currentY > 0 ? (currentY / this.height) * targetHeight : 0;

    canvas.width = this.width * ratio;
    canvas.height = this.height * ratio;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    canvasContext.scale(ratio, ratio);
  }

  private animate() {
    const { progress, width, height, step, currentX, currentY } = this;
    const targetX = (progress * width) / 100 - currentX;
    const targetY = (progress * height) / 100 - currentY;
    this.requestAnimationId = window.requestAnimationFrame(
      step.bind(this, currentX, currentY, 0, targetX, targetY)
    );
  }

  private step(
    currentX: number,
    currentY: number,
    currentIteration: number,
    targetX: number,
    targetY: number
  ) {
    const { config, drawFrame, iterationCount, step, width } = this;
    const changePercent = currentIteration / iterationCount;
    let x = easingFunctions[config.easingFunction](changePercent) * targetX;
    x += currentX;

    let y = easingFunctions[config.easingFunction](changePercent) * targetY;
    y += currentY;

    drawFrame.call(this, x, y);
    this.currentX = x;
    this.currentY = y;
    currentIteration++;

    const numericChange =
      (this.progress - this.previousProgress) * changePercent +
      this.previousProgress;

    this.updateNumericDisplay(numericChange);

    if (currentIteration <= iterationCount) {
      this.requestAnimationId = window.requestAnimationFrame(
        step.bind(this, currentX, currentY, currentIteration, targetX, targetY)
      );
    }

    if (x === width) {
      config.onComplete();
    }
  }

  private drawFrame(currentX: number, currentY: number) {
    if (this.config.drawVertical) {
      this.drawVertical(currentY);
    } else {
      this.drawHorizontal(currentX);
    }
  }

  private drawVertical(y: number) {
    const { canvasContext, width, height, foreground, background } = this;
    const { imageWidth, imageHeight } = this.imageSize;

    canvasContext.clearRect(0, 0, width, height);
    const offset = y * (imageHeight / height);

    canvasContext.drawImage(
      foreground,
      0,
      imageHeight - offset,
      imageWidth,
      imageHeight,
      0,
      height - y,
      width,
      height
    );

    canvasContext.drawImage(
      background,
      0,
      0,
      imageWidth,
      imageHeight - offset,
      0,
      0,
      width,
      height - y
    );
  }

  private drawHorizontal(x: number) {
    const {
      canvasContext,
      width,
      height,
      foreground,
      background,
      config
    } = this;
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

  private setCanvas() {
    this.canvas = this.container.querySelector('canvas');
    this.canvasContext = this.canvas.getContext('2d');
  }

  private setContainer() {
    this.container = this.resolveContainer();
    this.container.appendChild(htmlToElement(this.template));
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

  private registerResizeHandler() {
    window.addEventListener('resize', this.resize);
  }
}
