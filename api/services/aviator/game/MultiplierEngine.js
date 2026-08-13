class MultiplierEngine {

    constructor() {
        // Update tick interval in ms (100ms = 10 ticks per second for smooth, steady flight)
        this.tickRate = 100;
    }

    /**
     * Get next multiplier
     * @param {number} currentMultiplier
     * @returns {number}
     */
    next(currentMultiplier) {

        let increment = 0.008;

        // Smooth, realistic Aviator growth curves
        if (currentMultiplier < 2.0) {
            increment = 0.008;
        } else if (currentMultiplier < 5.0) {
            increment = 0.015;
        } else if (currentMultiplier < 10.0) {
            increment = 0.03;
        } else {
            increment = 0.06;
        }

        return Number(
            (currentMultiplier + increment).toFixed(2)
        );
    }

    /**
     * Reset multiplier
     */
    reset() {
        return 1.00;
    }

}

export default new MultiplierEngine();