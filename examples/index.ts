import { ImageFillProgressBar } from '../src/imagefill-progressbar';
import { ImageFillProgressBarConfig } from '../src/ImageFillProgressBarConfig';

export class Examples {
  constructor() {
    this.init();
  }

  private init() {
    this.initHalloween();
    this.initCity();
  }

  private async initHalloween() {
    const config: ImageFillProgressBarConfig = {
      backgroundSrc: './assets/images/pumpkin_outline.png',
      foregroundSrc: './assets/images/pumpkin_filled.png',
      animationDurationMs: 1000,
      numericDisplayFormatter: (val) => {
        const next = new Date(2019, 9, 31).getTime();
        const now = new Date().getTime();
        const remaining = new Date(next - now);
        return `
        <h1>Time until Halloween:</h1>
          <div class="halloween-value">
            ${remaining.getMonth()} Month
            ${remaining.getDate()} Days
            ${remaining.getHours()} Hours
            ${remaining.getMinutes()} Minutes
            ${remaining.getSeconds()} Seconds
          </div>`;
      },
      showNumericDisplay: true,
      container: '.halloween-section'
    };

    const progressBar = new ImageFillProgressBar(config);
    await progressBar.init();
    this.startHalloweenCountdown(progressBar);
  }

  private async initCity() {
    const config: ImageFillProgressBarConfig = {
      backgroundSrc: './assets/images/city_bw.png',
      foregroundSrc: './assets/images/city.png',
      animationDurationMs: 1000,
      numericDisplayFormatter: (val) => `
           <div style="
           color: white;
           width: 50px;
           height: 50px;
           border-radius: 50%;
           text-align: center;
           line-height: 50px;
           background-color: #68998A;
           font-weight: bold;
           ">${Math.floor(val).toString()}</div>
      `,
      showNumericDisplay: true,
      container: '.city-section'
    };

    const progressBar = new ImageFillProgressBar(config);
    await progressBar.init();

    animateCity();

    function animateCity() {
      let progress = 0;
      const interval = setInterval(() => {
        progressBar.update(progress);

        if (progress === 100) {
          clearInterval(interval);
          animateCity()
        }

        progress += 25;
      }, 700);
    }
  }

  private startHalloweenCountdown(progressBar: ImageFillProgressBar) {
    const currentYear = new Date().getFullYear();
    setInterval(() => {
      const last = new Date(currentYear - 1, 9, 31).getTime();
      const next = new Date(currentYear, 9, 31).getTime();
      const now = new Date().getTime();

      const updateValue =
        Math.round(((now - last) / (next - last)) * 10000) / 100;
      progressBar.update(updateValue);
    }, 1000);
  }
}

new Examples();
