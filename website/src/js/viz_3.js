import crossfilter from "crossfilter2";
import vegaEmbedModule, {
    vega
} from "vega-embed";
import Viz from "./viz_core";

(function () {
    const currViz = "PlayViz3";

    Viz.VIZUALIZATIONS[currViz] = function () {
        const filter = crossfilter(Viz.DATA);
        const raw = filter.dimension(function (o) {
            return o['industry_cat'];
        });

        let dataByIndustry = [];
        let dataByCountry = [];

        function prepareData() {
            const cats = Object.keys(Viz.INDUSTRY_COLORS);

            dataByIndustry = [];
            dataByCountry = [];

            cats.forEach((cat) => {
                const segment = raw.filter(cat).top(Infinity);

                const tempFilter = crossfilter(segment);
                const rawByCountry = tempFilter.dimension(function (o) {
                    return o["country"];
                });

                const countriesForSegment = rawByCountry.group().top(Infinity);
                countriesForSegment.forEach((c) => {
                    const country = rawByCountry.filter(c.key).top(Infinity);
                    const countryRevenue = country.reduce((total, current) => total += parseFloat(current['Revenue']), 0).toFixed(2);
                    const countryNumber = country.length;

                    const country_hu = country[0]['country_hu'];

                    dataByCountry.push({
                        'industry': cat,
                        'country': c.key,
                        'country_hu': country_hu,
                        'revenue': countryRevenue,
                        'number': countryNumber,
                        'industry_hu': Viz.INDUSTRY_HU[cat]
                    });
                });

                const segmentsRevenue = segment.reduce((total, current) => total += parseFloat(current['Revenue']), 0).toFixed(2);
                const segmentsCompanies = segment.length;

                dataByIndustry.push({
                    'industry': cat,
                    'revenue': segmentsRevenue,
                    'number': segmentsCompanies,
                    'industry_hu': Viz.INDUSTRY_HU[cat]
                });
            });
        }

        const innerWidth = 500;
        const innerHeight = 300;
        const innerRadius = 85;

        function makeSpecInnerLayer(fieldData, title) {
            return {
                "$schema": 'https://vega.github.io/schema/vega-lite/v5.json',
                "description": 'V3',
                "config": {
                    "background": "transparent",
                    "view": {
                        "stroke": "transparent"
                    },
                    "legend": {
                        "disable": true
                    }
                },
                "width": 350,
                "height": innerHeight * .9,
                "data": {
                    "name": "table"
                },
                "encoding": {
                    "theta": {
                        "field": fieldData,
                        "type": "quantitative"
                    },
                    "color": {
                        "condition": {
                            "param": "pts",
                            "field": "industry",
                            "type": "nominal",
                            "scale": {
                                "domain": Object.keys(Viz.INDUSTRY_COLORS),
                                "range": Object.values(Viz.INDUSTRY_COLORS)
                            }
                        },
                        "value": Viz.COLORS['grey']
                    },
                    "tooltip": [{
                            "field": "industry_hu",
                            "type": "nominal",
                            "title": "Aliparág"
                        },
                        {
                            "field": fieldData,
                            "type": "quantitative",
                            "title": title
                        }
                    ]
                },
                "params": [{
                    "name": "pts",
                    "select": {
                        "type": "point"
                    }
                }],
                "mark": {
                    "type": "arc",
                    "innerRadius": innerRadius,
                    "stroke": Viz.COLORS['grey']
                }
            };
        }

        function makeSpecOuterLayer(fieldData, title) {
            return {
                "$schema": 'https://vega.github.io/schema/vega-lite/v5.json',
                "description": 'V3',
                "config": {
                    "background": "transparent",
                    "view": {
                        "stroke": "transparent"
                    },
                    "legend": {
                        "disable": true
                    }
                },
                "width": innerWidth * 1.75,
                "height": innerHeight * 1.75,
                "data": {
                    "name": "table"
                },
                "encoding": {
                    "theta": {
                        "field": fieldData,
                        "type": "quantitative"
                    },
                    "color": {
                        "condition": {
                            "param": "pts",
                            "field": "industry",
                            "title": "Aliparág",
                            "type": "nominal",
                            "scale": {
                                "domain": Object.keys(Viz.INDUSTRY_COLORS),
                                "range": Object.values(Viz.INDUSTRY_COLORS)
                            }
                        },
                        "value": Viz.COLORS['grey']
                    },
                    "tooltip": [{
                            "field": "industry_hu",
                            "type": "nominal",
                            "title": "Aliparág"
                        },
                        {
                            "field": "country_hu",
                            "type": "nominal",
                            "title": "Ország"
                        },
                        {
                            "field": fieldData,
                            "type": "quantitative",
                            "title": title
                        }
                    ]
                },
                "params": [{
                    "name": "pts",
                    "select": {
                        "type": "point"
                    }
                }],
                "mark": {
                    "type": "arc",
                    "innerRadius": innerRadius * 2,
                    "stroke": Viz.COLORS['grey']
                }
            }
        }

        (function () {
            const legendContainer = document.querySelector("#viz3Legend");

            let html = "";

            Object.keys(Viz.INDUSTRY_COLORS).forEach((cat) => {
                html += `<p><span style="background-color: ${Viz.INDUSTRY_COLORS[cat]}"></span> ${Viz.INDUSTRY_HU[cat]}</p>`;
            });
            
            legendContainer.innerHTML = html;
        })();

        prepareData();

        const dropdown = document.querySelector("#pieChoice");

        function redraw() {
            const choice = dropdown.value;
            
            if (choice === 'revenue') {
                vegaEmbedModule("#viz_3", makeSpecInnerLayer("revenue", "Árbevétel"), {
                    renderer: "canvas",
                    actions: false
                }).then(function (res) {
                    const changeSet = vega.changeset().remove(vega.truthy).insert(dataByIndustry);
                    res.view.change("table", changeSet).run();
                })
                .catch(function (err) {
                    console.warn(err);
                });
                vegaEmbedModule("#viz_4", makeSpecOuterLayer("revenue", "Árbevétel"), {
                    renderer: "canvas",
                    actions: false
                }).then(function (res) {
                    const changeSet = vega.changeset().remove(vega.truthy).insert(dataByCountry);
                    res.view.change("table", changeSet).run();
                }).catch(function (err) {
                    console.warn(err);
                });
            } else if (choice === 'number') {
                vegaEmbedModule("#viz_3", makeSpecInnerLayer("number", "Vállalatok száma"), {
                    renderer: "canvas",
                    actions: false
                }).then(function (res) {
                    const changeSet = vega.changeset().remove(vega.truthy).insert(dataByIndustry);
                    res.view.change("table", changeSet).run();
                })
                .catch(function (err) {
                    console.warn(err);
                });
                vegaEmbedModule("#viz_4", makeSpecOuterLayer("number", "Vállalatok száma"), {
                    renderer: "canvas",
                    actions: false
                }).then(function (res) {
                    const changeSet = vega.changeset().remove(vega.truthy).insert(dataByCountry);
                    res.view.change("table", changeSet).run();
                }).catch(function (err) {
                    console.warn(err);
                });
            } else {
                console.warn("Invalid choice for pie chart.");
            }
        }

        dropdown.addEventListener("change", redraw);

        redraw();
    };
}());