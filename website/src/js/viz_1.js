import crossfilter from "crossfilter2";
import vegaEmbedModule, {
    vega
} from "vega-embed";
import Viz from "./viz_core";

(function () {
    const currViz = "PlayViz1";

    Viz.VIZUALIZATIONS[currViz] = function () {
        const WIDTH = 1500;
        const HEIGHT = 750;

        const filter = crossfilter(Viz.DATA);

        const dataByYear = filter.dimension(function (o) {
            return o['Founded'];
        })

        const makeData = function (rangeOfYearlyData) {
            const tempCrossfilter = crossfilter(rangeOfYearlyData);

            const dataByCity = tempCrossfilter.dimension(function (o) {
                return o['geoc_city'];
            });
            const groups = dataByCity.group().top(Infinity);

            const coords = {};
            dataByCity.top(Infinity).forEach((o) => {
                coords[o['geoc_city']] = {
                    'coord_lat': o['coord_lat'],
                    'coord_lon': o['coord_lon'],
                    'weight': groups.find(function (c) {
                        return c.key === o['geoc_city'];
                    }).value
                }
            });

            const coords_arr = [];

            Object.keys(coords).forEach((o) => {
                coords_arr.push({
                    'city': o,
                    'coord_lat': coords[o]['coord_lat'],
                    'coord_lon': coords[o]['coord_lon'],
                    'weight': coords[o]['weight']
                });
            });

            return coords_arr;
        }

        const spec = {
            "$schema": 'https://vega.github.io/schema/vega-lite/v5.json',
            "description": 'V1',
            "config": {
                "background": null,
                "view": {
                    "stroke": "transparent"
                },
                "legend": {
                    "orient": "none",
                    "direction": "horizontal",
                    "titleColor": "#fff",
                    "legendX": WIDTH / 1.5 - 50,
                    "legendY": 0
                }
            },
            "layer": [{
                    "width": WIDTH,
                    "height": HEIGHT,
                    "data": {
                        "url": "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries-sans-antarctica.json",
                        "format": {
                            "type": "topojson",
                            "feature": "countries1"
                        }
                    },
                    "projection": {
                        "type": "naturalEarth1"
                    },
                    "mark": {
                        "type": "geoshape",
                        "fill": Viz.COLORS['light-grey'],
                        "stroke": Viz.COLORS['background']
                    }
                },
                {
                    "data": {
                        "name": "table"
                    },
                    "projection": {
                        "type": "naturalEarth1"
                    },
                    "mark": {
                        "type": "circle",
                    },
                    "encoding": {
                        "longitude": {
                            "field": "coord_lon",
                            "type": "quantitative"
                        },
                        "latitude": {
                            "field": "coord_lat",
                            "type": "quantitative"
                        },
                        "size": {
                            "field": "weight",
                            "type": "quantitative"
                        },
                        "color": {
                            "value": Viz.COLORS['main-blue']
                        },
                        "tooltip": [{
                                "field": "city",
                                "type": "nominal",
                                "title": "Város"
                            },
                            {
                                "field": "weight",
                                "type": "quantitative",
                                "title": "Vállalatok száma"
                            }
                        ]
                    }
                }
            ]
        };

        let view = null;

        vegaEmbedModule("#viz_1", spec, {
                renderer: "canvas",
                actions: false
            })
            .then(function (res) {
                view = res.view;
                const changeSet = vega.changeset().insert(makeData(dataByYear.filterRange([1930, 2020]).top(Infinity)));
                view.change("table", changeSet).run();
            })
            .catch(function (err) {
                console.warn(err);
            });

        function stream() {
            let yearCounter = 1930;
            let previous = 0;

            const interval = setInterval(function () {
                if (yearCounter === 2020) clearInterval(interval);

                const data = makeData(dataByYear.filterRange([1930, yearCounter]).top(Infinity));
                const changeSet = vega.changeset().remove(vega.truthy).insert(data);
                view.change("table", changeSet).run();
                document.querySelector("#Viz1Year").textContent = yearCounter;
                document.querySelector("#Viz1Counter").textContent = data.length - previous;
                yearCounter++;
                previous = data.length;
            }, 97);
        }

        document.querySelector(`#${currViz}`).addEventListener('click', stream);
    };
}());