export default class Viz {
    static DATA = {};
    static COLORS = {};
    static VIZUALIZATIONS = [];
    static FILTER = null;

    constructor() {
        Viz.VIZUALIZATIONS.forEach(v => v());
    };
};