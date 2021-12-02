import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {Integration} from '@rfind-web/api-interfaces';
import { UniformHeatmapDataSeries } from "scichart/Charting/Model/UniformHeatmapDataSeries";
import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
import { SciChartSurface } from "scichart/Charting/Visuals/SciChartSurface";
import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
import { EAxisAlignment } from "scichart/types/AxisAlignment";
import { FastColumnRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastColumnRenderableSeries";
import { NumberRange } from "scichart/Core/NumberRange";
import { EAutoRange } from "scichart/types/AutoRange";
import { HeatmapColorMap } from "scichart/Charting/Visuals/RenderableSeries/HeatmapColorMap";
import { UniformHeatmapRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/UniformHeatmapRenderableSeries";

interface TimeFrequencyChartsProps {
    latestIntegration: Integration;
}


const divElementIdFttChart = "sciChart1";
const divElementIdSpecgramChart = "sciChart2";

const TOP_CHART_WIDTH = 600;
const TOP_CHART_HEIGHT = 600;
const BOTTOM_CHART_WIDTH = 288;
const BOTTOM_CHART_HEIGHT = 289;
const CHART_MARGIN = 14;

const REBINNED_SPECTRA_SIZE = 1024;
const HZ_PER_DATA_POINT = 600000/REBINNED_SPECTRA_SIZE;




const TimeFrequencyCharts: React.FC<TimeFrequencyChartsProps> = (props) => {
    const {latestIntegration} = props;

    const [fftChartInitialized, setFftChartInitialized] = useState<boolean>(false);
    const [specgramChartInitialized, setSpecgramChartInitialized] = useState<boolean>(false);
    
    let fftXValues: number[];
    let spectrogramValues: number [][];

    let fftDS: XyDataSeries;
    let spectrogramDS: UniformHeatmapDataSeries;

    const updateAnalysers = useCallback((): void=> {

        // Update FFT Chart
        if (fftChartInitialized){
            fftDS.clear();
            fftDS.appendRange(fftXValues, latestIntegration.bins);
        }

        // Update Spectrogram Chart
        if (specgramChartInitialized){
            spectrogramValues.shift();
            spectrogramValues.push(latestIntegration.bins);
            spectrogramDS.setZValues(spectrogramValues);
        }
    },[latestIntegration, fftChartInitialized, specgramChartInitialized])


    const initFftChart = useCallback(async () => {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(
            divElementIdFttChart,
            {
                widthAspect: BOTTOM_CHART_WIDTH,
                heightAspect: BOTTOM_CHART_HEIGHT
            }
        );
        const xAxis = new NumericAxis(wasmContext, {
            drawMajorTickLines: false,
            maxAutoTicks: 5,
            axisAlignment: EAxisAlignment.Top
        });
        sciChartSurface.xAxes.add(xAxis);

        const yAxis = new NumericAxis(wasmContext, {
            axisAlignment: EAxisAlignment.Right,
            visibleRange: new NumberRange(-30, 70),
            growBy: new NumberRange(0.1, 0.1),
            drawMinorTickLines: false,
            drawMajorTickLines: false,
            maxAutoTicks: 5
        });
        sciChartSurface.yAxes.add(yAxis);

        fftDS = new XyDataSeries(wasmContext);
        fftXValues = new Array<number>(REBINNED_SPECTRA_SIZE);
        for (let i = 0; i < REBINNED_SPECTRA_SIZE; i++) {
            fftXValues[i] = i * HZ_PER_DATA_POINT;
        }

        const rs = new FastColumnRenderableSeries(wasmContext, {
            stroke: "#E6E6FA",
            dataSeries: fftDS,
            zeroLineY: -30
        });
        sciChartSurface.renderableSeries.add(rs);

        setFftChartInitialized(true);

        return sciChartSurface;
    },[setFftChartInitialized]);

    // SPECTROGRAM CHART
    const initSpectogramChart = useCallback(async () => {
        spectrogramValues = new Array<number[]>(REBINNED_SPECTRA_SIZE);
        for (let i = 0; i < REBINNED_SPECTRA_SIZE; i++) {
            spectrogramValues[i] = new Array<number>(REBINNED_SPECTRA_SIZE);
            for (let j = 0; j < REBINNED_SPECTRA_SIZE; j++) {
                spectrogramValues[i][j] = 0;
            }
        }

        const { sciChartSurface, wasmContext } = await SciChartSurface.create(
            divElementIdSpecgramChart,
            {
                widthAspect: BOTTOM_CHART_WIDTH,
                heightAspect: BOTTOM_CHART_HEIGHT
            }
        );

        const xAxis = new NumericAxis(wasmContext, {
            autoRange: EAutoRange.Always,
            drawLabels: false,
            drawMinorTickLines: false,
            drawMajorTickLines: false
        });
        sciChartSurface.xAxes.add(xAxis);

        const yAxis = new NumericAxis(wasmContext, {
            autoRange: EAutoRange.Always,
            drawLabels: false,
            drawMinorTickLines: false,
            drawMajorTickLines: false
        });
        sciChartSurface.yAxes.add(yAxis);

        spectrogramDS = new UniformHeatmapDataSeries(wasmContext, {
            xStart: 0,
            xStep: 1,
            yStart: 0,
            yStep: 1,
            zValues: spectrogramValues
        });

        const rs = new UniformHeatmapRenderableSeries(wasmContext, {
            dataSeries: spectrogramDS,
            colorMap: new HeatmapColorMap({
                minimum: -30,
                maximum: 70,
                gradientStops: [
                    { offset: 0, color: "#000000" },
                    { offset: 0.0001, color: "#00008B" },
                    { offset: 0.25, color: "#800080" },
                    { offset: 0.5, color: "#FF0000" },
                    { offset: 0.75, color: "#FFFF00" },
                    { offset: 1, color: "#FFFFFF" }
                ]
            })
        });
        sciChartSurface.renderableSeries.add(rs);

        setSpecgramChartInitialized(true)

        return sciChartSurface;
    },[setSpecgramChartInitialized]);

    const charts: SciChartSurface[] = [];

    const pushCharts = useEffect(() => {
        async function pushChartsInternal(){
            charts.push(await initFftChart());
            charts.push(await initSpectogramChart());
        }
        pushChartsInternal()

    },[])

    return (
        <React.Fragment>
            <div id={divElementIdFttChart} />
            <div id={divElementIdSpecgramChart} />
        </React.Fragment>

    );
}
export default TimeFrequencyCharts
