import crossfilter from "crossfilter2";
import vegaEmbedModule, {
    vega
} from "vega-embed";
import Viz from "./viz_core";

(function () {
    const currViz = "PlayViz5";

    Viz.VIZUALIZATIONS[currViz] = function () {
        const filter = crossfilter(Viz.DATA);
        const raw = filter.dimension(function (o) {
            return o['country'];
        });

        const data = [];

        function makeData() {
            const countries = raw.group().top(Infinity);

            countries.forEach((country) => {
                const rawByCountry = raw.filter(country.key).top(Infinity);

                const sum = rawByCountry.reduce((total, current) => total += parseFloat(current['Revenue']), 0).toFixed(2);

                data.push({
                    'country': country.key,
                    'country_hu': rawByCountry[0]['country_hu'],
                    'id': rawByCountry[0]['iso3_code'],
                    'sum': sum
                });
            });
        }

        makeData();

        const coords_data = function () {
            const tempCrossfilter = crossfilter(Viz.DATA);

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
                    }).value,
                    'country': o['country_hu']
                }
            });

            const coords_arr = [];

            Object.keys(coords).forEach((o) => {
                coords_arr.push({
                    'city': o,
                    'coord_lat': coords[o]['coord_lat'],
                    'coord_lon': coords[o]['coord_lon'],
                    'weight': coords[o]['weight'],
                    'country': coords[o]['country']
                });
            });

            return coords_arr;
        }();

        const spec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": "V6",
            "width": 1500,
            "height": 750,
            "config": {
                "background": null,
                "view": {
                    "stroke": "transparent"
                },
                "legend": {
                    "cornerRadius": 25,
                    "labelFontSize": 13,
                    "labelPadding": 10,
                    "titleFontSize": 15,
                    "gradientLabelOffset": 8
                }
            },
            "layer": [{
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
            }, {
                "data": {
                    "url": "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries-sans-antarctica.json",
                    "format": {
                        "type": "topojson",
                        "feature": "countries1"
                    }
                },
                "transform": [{
                    "lookup": "id",
                    "from": {
                        "data": {
                            "name": "table"
                        },
                        "key": "id",
                        "fields": ["sum", "country_hu"]
                    }
                }],
                "projection": {
                    "type": "naturalEarth1"
                },
                "mark": "geoshape",
                "encoding": {
                    "color": {
                        "field": "sum",
                        "type": "quantitative",
                        "title": "Összárbevétel",
                        "scale": {
                            "range": ["#c4e8f5", "#076F94"]
                        }
                    },
                    "tooltip": [{
                            "field": "country_hu",
                            "type": "nominal",
                            "title": "Ország"
                        },
                        {
                            "field": "sum",
                            "type": "quantitative",
                            "title": "Összárbevétel"
                        }
                    ]
                }
            }, {
                "data": {
                    "values": coords_data
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
                        "type": "quantitative",
                        "title": "Vállalatok száma"
                    },
                    "color": {
                        "value": Viz.COLORS['orange']
                    },
                    "tooltip": [{
                            "field": "country",
                            "type": "nominal",
                            "title": "Ország"
                        },
                        {
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
            }]
        }

        vegaEmbedModule("#viz_6", spec, {
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