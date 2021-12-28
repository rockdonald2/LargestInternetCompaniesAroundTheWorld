import crossfilter from "crossfilter2";
import vegaEmbedModule, {
    vega
} from "vega-embed";
import Viz from "./viz_core";

(function () {
    const currViz = "PlayViz4";

    Viz.VIZUALIZATIONS[currViz] = function () {
        const filter = crossfilter(Viz.DATA);
        const raw = filter.dimension(function (o) {
            return o['country'];
        });

        const data = [];

        function prepareData() {
            const countries = raw.group().top(Infinity);

            countries.forEach((country) => {
                const tempFilter = crossfilter(raw.filter(country.key).top(Infinity));
                const rawByCountry = tempFilter.dimension(function (o) {
                    return o['industry_cat'];
                });
                const country_hu = rawByCountry.top(Infinity)[0]['country_hu'];
                const countryAll = rawByCountry.top(Infinity).length;

                const sumAllRevenue = rawByCountry.top(Infinity).reduce((total, current) => total += parseFloat(current['Revenue']), 0).toFixed(2);

                rawByCountry.group().top(Infinity).forEach((industry) => {
                    const segment = rawByCountry.filter(industry.key).top(Infinity);
                    const segmentNumber = segment.length;
                    const industry_hu = segment[0]['industry_cat_hu'];

                    const sumRevenue = segment.reduce((total, current) => total += parseFloat(current['Revenue']), 0).toFixed(2);

                    data.push({
                        'country': country.key,
                        'industry': industry.key,
                        'num_number': segmentNumber,
                        'num_percentage': (segmentNumber / countryAll * 100).toFixed(2),
                        'revenue_number': sumRevenue,
                        'revenue_percentage': (sumRevenue / sumAllRevenue * 100).toFixed(2),
                        'country_hu': country_hu,
                        'industry_hu': industry_hu
                    })
                });
            });
        };

        prepareData();

        function makeSpec(choice) {
            return {
                "$schema": 'https://vega.github.io/schema/vega-lite/v5.json',
                "description": 'V4',
                "config": {
                    "background": null,
                    "view": {
                        "stroke": "transparent"
                    },
                    "legend": {
                        "disable": true
                    }
                },
                "width": 1150,
                "height": 400,
                "autosize": {
                    "type": "fit",
                    "contains": "padding"
                },
                "data": {
                    "name": "table"
                },
                "mark": {
                    "type": "bar",
                    "opacity": 1,
                    "stroke": Viz.COLORS["grey"]
                },
                "encoding": {
                    "x": {
                        "aggregate": "sum",
                        "field": choice,
                        "type": "quantitative",
                        "axis": {
                            "gridColor": "transparent",
                            "labelPadding": 10,
                            "labelFontSize": 14,
                            "tickColor": Viz.COLORS['grey'],
                            "domainColor": Viz.COLORS['grey'],
                            "title": "",
                            "titleFontSize": 15,
                            "titlePadding": 25,
                            "titleFontWeight": 400
                        }
                    },
                    "y": {
                        "field": "country_hu",
                        "type": "nominal",
                        "axis": {
                            "gridColor": "transparent",
                            "labelPadding": 10,
                            "labelFontSize": 14,
                            "tickColor": "#fff",
                            "domainColor": Viz.COLORS['grey'],
                            "title": "Alapítási év",
                            "titleFontSize": 15,
                            "titlePadding": 180,
                            "titleFontWeight": 400,
                        }
                    },
                    "color": {
                        "field": "industry",
                        "type": "nominal",
                        "scale": {
                            "domain": Object.keys(Viz.INDUSTRY_COLORS),
                            "range": Object.values(Viz.INDUSTRY_COLORS)
                        }
                    },
                    "tooltip": [{
                            "field": "industry_hu",
                            "type": "nominal",
                            "title": "Iparág"
                        },
                        {
                            "field": "num_number",
                            "type": "quantitative",
                            "title": "Vállalatok száma"
                        },
                        {
                            "field": "num_percentage",
                            "type": "quantitative",
                            "title": "Vállalatok számából kitesz"
                        },
                        {
                            "field": "revenue_number",
                            "type": "quantitative",
                            "title": "Vállalatok árbevétele"
                        },
                        {
                            "field": "revenue_percentage",
                            "type": "quantitative",
                            "title": "Vállalatok árbevételéből kitesz"
                        },
                    ]
                }
            };
        }

        (function () {
            const legendContainer = document.querySelector("#viz5Legend");

            let html = "";

            Object.keys(Viz.INDUSTRY_COLORS).forEach((cat) => {
                html += `<p><span style="background-color: ${Viz.INDUSTRY_COLORS[cat]}"></span> ${Viz.INDUSTRY_HU[cat]}</p>`;
            });
            
            legendContainer.innerHTML = html;
        })();

        const dropdown = document.querySelector("#barchartChoice");

        function redraw() {
            const choice = dropdown.value;

            vegaEmbedModule("#viz_5", makeSpec(choice), {
                renderer: "canvas",
                actions: false
            }).then(function (res) {
                const changeSet = vega.changeset().insert(data);
                res.view.change("table", changeSet).run();
            })
            .catch(function (err) {
                console.warn(err);
            });
        }

        dropdown.addEventListener('change', redraw);

        redraw();
    };
}());