import { CityFillComponent } from "./components/city-fill.component";
import { HalloweenComponent } from "./components/halloween.component";
import { WaterGoalComponent } from "./components/water-goal.component";
import { CustomizableFillComponent } from "./components/customizable-fill.component";

export class Examples {
    constructor() {
        this.init();
    }

    private init() {
        new CityFillComponent('.city-section')
        new WaterGoalComponent('.bottle-section')
        new HalloweenComponent('.halloween-section')
        new CustomizableFillComponent('.customizable-fill-section')
    }
}

new Examples();
