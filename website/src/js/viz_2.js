import crossfilter from "crossfilter2";
import {
    range
} from "d3v4";
import vegaEmbedModule, {
    vega
} from "vega-embed";
import Viz from "./viz_core";

(function () {
    const currViz = "PlayViz2";

    Viz.VIZUALIZATIONS[currViz] = function () {
        const WIDTH = 1150;
        const HEIGHT = 250;
        const RADIUS = 125;

        const filter = crossfilter(Viz.DATA);
        const data = filter.dimension(function (o) {
            return o['industry_cat'];
        });

        const spec = {
            "$schema": 'https://vega.github.io/schema/vega-lite/v5.json',
            "description": 'V2',
            "config": {
                "background": null,
                "view": {
                    "stroke": "transparent"
                },
                "legend": {
                    "disable": true
                }
            },
            "width": WIDTH,
            "height": HEIGHT,
            "data": {
                "name": "table"
            },
            "mark": {
                "type": "circle",
                "opacity": 1,
                "size": RADIUS
            },
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
                    "type": "quantitative",
                    "scale": {
                        "domain": [1930, 2020]
                    },
                    "axis": {
                        "format": "",
                        "gridColor": "transparent",
                        "labelAngle": -45,
                        "labelPadding": 10,
                        "labelFontSize": 14,
                        "tickColor": Viz.COLORS['grey'],
                        "domainColor": Viz.COLORS['grey'],
                        "title": "Alapítási év",
                        "titleFontSize": 15,
                        "titlePadding": 25,
                        "titleFontWeight": 400
                    }
                },
                "y": {
                    "field": "idx",
                    "type": "ordinal",
                    "sort": "descending",
                    "axis": null,
                    "scale": {
                        "domain": range(20, 0, -1)
                    }
                },
                "color": {
                    "field": "industry_cat",
                    "type": "nominal",
                    "scale": {
                        "domain": Object.keys(Viz.INDUSTRY_COLORS),
                        "range": Object.values(Viz.INDUSTRY_COLORS)
                    }
                },
                "tooltip": [{
                        "field": "Founded",
                        "type": "ordinal",
                        "title": "Bejegyzés éve"
                    },
                    {
                        "field": "Company",
                        "type": "nominal",
                        "title": "Vállalat neve"
                    },
                    {
                        "field": "geoc_city",
                        "type": "nominal",
                        "title": "Székhely"
                    },
                    {
                        "field": "industry_cat_hu",
                        "type": "nominal",
                        "title": "Aliparág"
                    },
                    {
                        "field": "country_hu",
                        "type": "nominal",
                        "title": "Ország"
                    }
                ]
            }
        };

        function multivalue_filter(values) {
            return function (v) {
                return values.indexOf(v) !== -1;
            };
        }

        let view = null;
        let interval = null;

        (function () {
            const catContainer = document.querySelector('#Viz2IndustryCats');
            let html = "";
            Object.keys(Viz.INDUSTRY_COLORS).forEach((k) => {
                html += `<div class="viz_container--filter__checkbox">
            <input type="checkbox" id="${k}Cat" value="${k}" checked="true">
            <label for="${k}Cat"><span id="${k.replaceAll(' ', '_')}Circle" class="viz_container--filter__checkbox--circle" style="background-color: ${Viz.INDUSTRY_COLORS[k]}"></span> ${Viz.INDUSTRY_HU[k]}</label>
          </div>`;
            });
            catContainer.innerHTML = html;
        })();

        const categories = document.querySelectorAll(".viz_container--filter__checkbox input[type='checkbox']");
        categories.forEach((k) => k.addEventListener('change', function () {
            if (this.checked) {
                document.querySelector(`#${this.value.replaceAll(' ', '_')}Circle`).style.backgroundColor = Viz.INDUSTRY_COLORS[this.value];
            } else {
                document.querySelector(`#${this.value.replaceAll(' ', '_')}Circle`).style.backgroundColor = Viz.COLORS['grey'];
            }

            const selectedCats = [];

            categories.forEach((cat) => {
                if (cat.checked) {
                    selectedCats.push(cat.value);
                }
            });

            clearInterval(interval);
            const initialData = data.filterFunction(multivalue_filter(selectedCats)).top(Infinity);
            const changeSet = vega.changeset().remove(vega.truthy).insert(initialData);
            view.change("table", changeSet).run();
        }));

        vegaEmbedModule("#viz_2", spec, {
                renderer: "canvas",
                actions: false
            }).then(function (res) {
                view = res.view;
                const changeSet = vega.changeset().insert(data.top(Infinity));
                view.change("table", changeSet).run();
            })
            .catch(function (err) {
                console.warn(err);
            });

        function stream(initialData) {
            let yearCounter = 1930;
            view.change("table", vega.changeset().remove(vega.truthy)).run();
            const tempCrossfilter = crossfilter(initialData);
            const dataByYear = tempCrossfilter.dimension(function (o) {
                return o['Founded'];
            });

            interval = setInterval(function () {
                if (yearCounter === 2020) clearInterval(interval);

                const newData = dataByYear.filter(yearCounter).top(Infinity).sort(function (a, b) {
                    if (a['industry_cat'] < b['industry_cat']) {
                        return -1;
                    }
                    if (a['industry_cat'] > b['industry_cat']) {
                        return 1;
                    }
                    return 0;
                });

                const changeSet = vega.changeset().insert(newData);
                view.change("table", changeSet).run();
                document.querySelector("#Viz2Year").textContent = yearCounter;
                document.querySelector("#Viz2Counter").textContent = newData.length;
                yearCounter++;
            }, 500);
        }

        document.querySelector(`#${currViz}`).addEventListener('click', function () {
            clearInterval(interval);

            const selectedCats = [];

            categories.forEach((cat) => {
                if (cat.checked) {
                    selectedCats.push(cat.value);
                }
            });

            const initialData = data.filterFunction(multivalue_filter(selectedCats)).top(Infinity);
            stream(initialData);
        });
    };
}());