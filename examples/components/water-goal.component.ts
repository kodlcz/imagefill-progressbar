import { ImageFillProgressBarConfig } from "../../src/ImageFillProgressBarConfig";
import { ImageFillProgressBar } from "../../src/imagefill-progressbar";

export class WaterGoalComponent {
    constructor(container: string) {
        this.init(container)
    }

    private async init(container: string) {
        let progress = 0;
        let dailyGoal = 2;
        let glassSize = 0.25;

        const progressMax = 80;

        const config: ImageFillProgressBarConfig = {
            backgroundSrc: './assets/images/bottle_empty.png',
            foregroundSrc: './assets/images/bottle_filled.png',
            showNumericDisplay: true,
            container: container,
            drawVertical: true,
            numericDisplayFormatter: (val: number) => {
                let currentQuantity = val / progressMax * dailyGoal
                currentQuantity = currentQuantity > dailyGoal ? dailyGoal : currentQuantity

                return `
                    <div>
                        ${currentQuantity.toFixed(2)} / ${dailyGoal} liters
                    </div>
                `
            }
        };

        const progressBar = new ImageFillProgressBar(config);
        await progressBar.init();


        const dailyGoalInput = document.querySelector('#daily-goal-input');
        dailyGoalInput.addEventListener('input', (e: Event) => {
            const goalInput = parseFloat((<HTMLInputElement>e.target).value)
            if (dailyGoal !== NaN) {
                dailyGoal = goalInput
            }
        })

        const glassSizeInput = document.querySelector('#glass-size-input');
        glassSizeInput.addEventListener('input', (e: Event) => {
            glassSize = parseFloat((<HTMLInputElement>e.target).value)
        })

        const addGlassButton = document.querySelector('#add-glass-button');
        addGlassButton.addEventListener('click', () => {
            if (progress < progressMax) {
                progress += (glassSize / dailyGoal * progressMax)
            }
            progressBar.update(progress);
        })

        const resetButton = document.querySelector('#reset-button')
        resetButton.addEventListener('click', () => {
            progress = 0
            progressBar.update(progress)
        })
    }
}