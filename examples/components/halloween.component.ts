import { ImageFillProgressBarConfig } from "../../src/ImageFillProgressBarConfig";
import { ImageFillProgressBar } from "../../src/imagefill-progressbar";

export class HalloweenComponent {
    private fastForwardActive = false
    private fastForwardRate = 300000000

    constructor(container: string) {
        this.init(container)
    }
    private async init(container: string) {
        const config: ImageFillProgressBarConfig = {
            backgroundSrc: './assets/images/pumpkin_outline.png',
            foregroundSrc: './assets/images/pumpkin_filled.png',
            animationDurationMs: 1000,
            numericDisplayFormatter: (val) => {
                const next = new Date(2022, 9, 31).getTime();
                let now = new Date().getTime();
                let remainingTime

                if (this.fastForwardActive) {
                    let aYearFromNow = new Date().setFullYear(new Date().getFullYear() + 1)
                    remainingTime = (aYearFromNow - now) * (100 - val) / 100
                } else {
                    remainingTime = next - now
                }
                const remaining = new Date(remainingTime);

                const months = this.normalizeValue(remaining.getMonth(), remainingTime)
                const days = this.normalizeValue(remaining.getDate(), remainingTime)
                const hours = this.normalizeValue(remaining.getHours(), remainingTime)
                const minutes = this.normalizeValue(remaining.getMinutes(), remainingTime)
                const seconds = this.normalizeValue(remaining.getSeconds(), remainingTime)

                return `
        <h2>Time until Halloween:</h2>
          <div class="halloween-value">
            ${months} Month
            ${days} Days
            ${hours}:${minutes}:${seconds}
          </div>`;
            },
            showNumericDisplay: true,
            container
        };

        const fastForwardButton = document.querySelector('#fast-forward')
        fastForwardButton.addEventListener('click', () => {
            this.fastForwardActive = true
        })

        const progressBar = new ImageFillProgressBar(config);
        await progressBar.init();
        this.startHalloweenCountdown(progressBar);
    }

    private normalizeValue(val, remainingTime) {
        if (remainingTime > 0) {
            return val < 10 ? '0' + val : val
        } else {
            return '00'
        }
    }

    private startHalloweenCountdown(progressBar: ImageFillProgressBar) {
        const currentYear = new Date().getFullYear();
        let counter = 0;
        const intervalFunctionId = setInterval(() => {
            const last = new Date(currentYear - 1, 9, 31).getTime();
            const next = new Date(currentYear, 9, 31).getTime();
            const now = new Date().getTime() + counter;

            if (this.fastForwardActive) {
                counter += this.fastForwardRate;
            }

            const updateValue =
                (Math.round(((now - last) / (next - last)) * 10000) / 100);

            if (updateValue <= 100) {
                progressBar.update(updateValue);
            } else {
                progressBar.update(100);
                clearInterval(intervalFunctionId)
            }

        }, 100);
    }
}