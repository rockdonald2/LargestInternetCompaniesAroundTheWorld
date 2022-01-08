import * as d3 from'd3v4';
export default class Viz {
    static DATA = {};
    static COLORS = {
        'main-blue': '#076F94',
        grey: '#DCDEDD',
        'light-grey': '#F2F2F2',
        background: '#FEFEFE',
        orange: '#F67067',
    };
    static VIZUALIZATIONS = {};
    static FILTER = null;
    static INDUSTRY_COLORS = {
        Education: '#16558F',
        Telecommunication: '#00181A',
        Delivery: '#00585A',
        'Real Estate': '#0583D2',
        Transportation: '#076F94',
        'Financial Services': '#0A97B7',
        Travel: '#42AFB6',
        'Social Media': '#55CFD6',
        Entertainment: '#4E9C82',
        Internet: '#024064',
        Software: '#7C9885',
        Ecommerce: '#007962',
    };
    static INDUSTRY_HU = {
        Ecommerce: 'E-kereskedelem',
        Internet: 'Internet',
        'Social Media': 'Közösségi média',
        Entertainment: 'Szórakoztatás',
        'Financial Services': 'Pénzügyi szolgáltatások',
        Software: 'Szoftver',
        Transportation: 'Szállítás',
        Travel: 'Utazás',
        'Real Estate': 'Ingatlan',
        Delivery: 'Házhozszállítás',
        Telecommunication: 'Telekommunikáció',
        Education: 'Oktatás',
    };
    static CONTINENT_COLORS = {
        'North America': '#007962',
        Asia: '#024064',
        Europe: '#42AFB6',
        'South America': '#00181A',
    };
    static CONTINENT_HU = {
        'North America': 'Észak-Amerika',
        Asia: 'Ázsia',
        Europe: 'Európa',
        'South America': 'Dél-Amerika',
    };
    static FONT = 'Inter';

    constructor() {
        Object.keys(Viz.VIZUALIZATIONS).forEach((k) => {
            Viz.VIZUALIZATIONS[k]();
        });

        setTimeout(() => {
            d3.select('.loader').attr('class', 'loader hide');
        }, 2000);
    }
}
