/**
 * The only module that imports Plotly. Loaded on demand through `Plot`, so
 * Plotly stays out of the map app's and the landing carousel's up-front code.
 *
 * A partial bundle: plotly.js core (which includes scatter) plus only the
 * trace types the app renders, instead of react-plotly.js's default import of
 * the full `plotly.js/dist/plotly`.
 */
import Plotly from 'plotly.js/lib/core';
import violin from 'plotly.js/lib/violin';
import bar from 'plotly.js/lib/bar';
import createPlotlyComponent from 'react-plotly.js/factory';

// No `pie`: its only user, SpeciesDonutChart, is imported nowhere (dead code).
// Register plotly.js/lib/pie here if that donut is ever rendered.
Plotly.register([violin, bar]);

const PlotlyChart = createPlotlyComponent(Plotly);

export default PlotlyChart;
