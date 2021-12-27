import crossfilter from "crossfilter2";
import vegaEmbedModule from "vega-embed";
import Viz from "./viz_core";

(function () {
    Viz.VIZUALIZATIONS.push(function () {
        const filter = crossfilter(Viz.DATA);
        const data = filter.dimension(function (o) {
            return o['geoc_city'];
        });
        const groups = data.group().top(Infinity);

        const coords = {};
        data.top(Infinity).forEach((o) => {
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

        const spec = {
            "$schema": 'https://vega.github.io/schema/vega-lite/v5.json',
            "description": 'V1',
            "config": {
                "background": null,
                "view": {
                    "stroke": "transparent"
                }
            },
            "vconcat": [{
                    "layer": [{
                            "width": 1500,
                            "height": 750,
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
                                "fill": "lightgray",
                                "stroke": "white"
                            }
                        },
                        {
                            "data": {
                                "values": coords_arr
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
                                    "value": "steelblue"
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
                },
                {
                    "width": 1500,
                    "data": {
                        "values": data.top(Infinity)
                    },
                    "mark": "circle",
                    "transform": [{
                        "window": [{
                            "op": "rank",
                            "as": "idx"
                        }],
                        "groupby": ["Founded"]
                    }],
                    "encoding": {
                        "x": {
                            "field": "Founded",
                            "type": "ordinal",
                            "title": "Alapítási év"
                        },
                        "y": {
                            "field": "idx",
                            "type": "ordinal",
                            "sort": "descending",
                            "axis": null
                        }
                    }
                }
            ]
        };

        vegaEmbedModule("#viz_1", spec, {
            renderer: "svg",
            actions: false
        });
    });
}());