import {ImageFillProgressBar} from '../lib/imagefill-progressbar';
import {ImageFillProgressBarConfig} from '../lib/ImageFillProgressBarConfig';

export class Examples {
  constructor() {
    this.init();
  }

  private init() {
    this.initHalloween();
  }

  private async initHalloween() {
    const config: ImageFillProgressBarConfig = {
      backgroundSrc: './assets/pumpkin_outline.png',
      foregroundSrc: './assets/pumpkin_filled.png',
      animationDurationMs: 1000,
      numericDisplayFormatter: (val) => {
        const next = new Date(2019, 9, 31).getTime();
        const now = new Date().getTime();
        const remaining = new Date(next - now);
        return `
          ${remaining.getMonth()} Month 
          ${remaining.getDate()} Days 
          ${remaining.getHours()} Hours 
          ${remaining.getMinutes()} Minutes 
          ${remaining.getSeconds()} Seconds`;
      },
      showNumericDisplay: true,
      container: '.halloween-section'
    };

    const progressBar = new ImageFillProgressBar(config);
    await progressBar.init();
    this.startHalloweenCountdown(progressBar);
  }

  private startHalloweenCountdown(progressBar: ImageFillProgressBar) {
    const currentYear = new Date().getFullYear();
    setInterval(() => {
      const last = new Date(currentYear - 1, 9, 31).getTime();
      const next = new Date(currentYear, 9, 31).getTime();
      const now = new Date().getTime();

      const updateValue = Math.round((now - last) / (next - last) * 10000) / 100;
      progressBar.update(updateValue);

    }, 1000)
  }
}

new Examples();

