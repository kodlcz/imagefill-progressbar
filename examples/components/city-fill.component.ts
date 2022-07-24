import { ImageFillProgressBarConfig } from '../../src/ImageFillProgressBarConfig';
import { ImageFillProgressBar } from '../../src/imagefill-progressbar';

export class CityFillComponent {
  constructor(container: string) {
    this.init(container);
  }

  private async init(container: string) {
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
      container: container
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
          animateCity();
        }

        progress += 25;
      }, 700);
    }
  }
}
