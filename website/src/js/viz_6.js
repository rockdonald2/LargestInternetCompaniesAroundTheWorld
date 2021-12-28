import crossfilter from "crossfilter2";
import vegaEmbedModule, {
    vega
} from "vega-embed";
import Viz from "./viz_core";

(function () {
    const currViz = "PlayViz6";

    Viz.VIZUALIZATIONS[currViz] = function () {
        const filter = crossfilter(Viz.DATA);
        const raw = filter.dimension(function (o) {
            return o['country'];
        });

        const data = [];

        function makeData() {
            const countries = raw.group().top(Infinity);

            countries.forEach((country) => {
                const segment = raw.filter(country.key).top(Infinity);

                const number = segment.length;
                const sum = segment.reduce((total, current) => total += parseFloat(current['Revenue']), 0);
                const avg = sum / number;

                data.push({
                    'country': country.key,
                    'sum': sum.toFixed(2),
                    'avg': avg.toFixed(2),
                    'number': number,
                    'country_hu': segment[0]['country_hu'],
                    'continent': segment[0]['continent'],
                    'continent_hu': segment[0]['continent_hu']
                })
            });
        }

        makeData();

        console.log(data);

        const spec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "V7",
            "width": 1000,
            "height": 500,
            "config": {
                "background": null,
                "view": {
                    "stroke": "transparent"
                },
                "legend": {
                    "disable": true
                }
            },
            "data": {
                "name": "table"
            },
            "params": [{
                "name": "grid",
                "select": "interval",
                "bind": "scales"
            }],
            "mark": "circle",
            "encoding": {
                "x": {
                    "field": "number",
                    "type": "quantitative",
                    "axis": {
                        "gridColor": Viz.COLORS['grey'],
                        "labelPadding": 10,
                        "labelFontSize": 14,
                        "domainColor": Viz.COLORS['grey'],
                        "tickColor": Viz.COLORS['grey'],
                        "titleFontSize": 15,
                        "titlePadding": 30,
                        "titleFontWeight": 400,
                    }
                },
                "y": {
                    "field": "sum",
                    "type": "quantitative",
                    "axis": {
                        "gridColor": Viz.COLORS['grey'],
                        "labelPadding": 10,
                        "labelFontSize": 14,
                        "domainColor": Viz.COLORS['grey'],
                        "tickColor": Viz.COLORS['grey'],
                        "titleFontSize": 15,
                        "titlePadding": 30,
                        "titleFontWeight": 400,
                    }
                },
                "size": {
                    "field": "avg",
                    "type": "quantitative"
                },
                "color": {
                    "field": "continent",
                    "type": "nominal",
                    "scale": {
                        "domain": Object.keys(Viz.CONTINENT_COLORS),
                        "range": Object.values(Viz.CONTINENT_COLORS)
                    }
                },
                "tooltip": [{
                        "field": "continent_hu",
                        "type": "nominal",
                        "title": "Kontinens"
                    },
                    {
                        "field": "country_hu",
                        "type": "nominal",
                        "title": "Ország"
                    },
                    {
                        "field": "avg",
                        "type": "quantitative",
                        "title": "Átlagárbevétel"
                    },
                    {
                        "field": "sum",
                        "type": "quantitative",
                        "title": "Összárbevétel"
                    },
                    {
                        "field": "number",
                        "type": "quantitative",
                        "title": "Vállalatok száma"
                    }
                ]
            }
        }

        vegaEmbedModule("#viz_7", spec, {
                renderer: "canvas",
                actions: false
            }).then(function (res) {
                const changeSet = vega.changeset().insert(data);
                res.view.change("table", changeSet).run();
            })
            .catch(function (err) {
                console.warn(err);
            });
    };
}());