import { ImageFillProgressBarConfig } from '../../src/ImageFillProgressBarConfig';
import { EasingFunction } from '../../src/easing-functions.enum';
import { ImageFillProgressBar } from '../../src/imagefill-progressbar';

export class CustomizableFillComponent {
  private progressbar: ImageFillProgressBar;
  private config: ImageFillProgressBarConfig = {
    backgroundSrc: './assets/images/city_bw.png',
    foregroundSrc: './assets/images/city.png',
    container: '',
    animationDurationMs: 1000,
    showNumericDisplay: false,
    numericDisplayFormatter: (val) => val.toString(),
    easingFunction: EasingFunction.easeOutQuint
  };
  private interval;

  constructor(container: string) {
    this.init(container);
  }

  private async init(container: string) {
    this.config.container = container;
    await this.runProgressbar();
    this.startListeningToInput()
  }

  private async runProgressbar() {
    this.progressbar = new ImageFillProgressBar(this.config);
    await this.progressbar.init();
    this.animateProgressbar()
  }

  private async resetProgressbar() {
    this.removeProgressbar();
    await this.runProgressbar();
  }

  private startListeningToInput() {
    const showNumericDisplayCheckbox = document.querySelector(
        '#show-numeric-display'
    );
    showNumericDisplayCheckbox.addEventListener('input', async (e) => {
      this.config.showNumericDisplay = (e.target as HTMLInputElement).checked;
      await this.resetProgressbar();
    });

    const animationDurationMs = document.querySelector<HTMLInputElement>(
        '#animation-duration-ms'
    );
    animationDurationMs.value = this.config.animationDurationMs.toString();
    animationDurationMs.addEventListener('input', async (e: Event) => {
      this.config.animationDurationMs = parseInt(
          (e.target as HTMLInputElement).value
      );
      await this.resetProgressbar();
    });

    const runButton = document.querySelector('#run-button');
    runButton.addEventListener('click', async () => this.resetProgressbar());
  }

  private animateProgressbar() {
    let progress = 0;
    this.interval = setInterval(() => {
      this.progressbar.update(progress);

      if (progress === 100) {
        clearInterval(this.interval);
        this.animateProgressbar()
      }
      progress += 25;
    }, 700);
  }

  private removeProgressbar() {
    clearInterval(this.interval)
    this.progressbar.cleanUp();
    const container = document.querySelector(this.config.container as string);
    const oldProgressbar = container.querySelector('.imagefill-progressbar');
    container.removeChild(oldProgressbar);
  }
}
