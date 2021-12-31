import * as d3 from "d3v4";
import Viz from "./viz_core";

(function () {
    'use strict';

    d3.queue()
        .defer(d3.csv, __data__)
        .await(ready);

    function ready(error, data) {
        if (error) {
            return console.warn(error);
        }

        Viz.DATA = data;

        new Viz();
    };
}());