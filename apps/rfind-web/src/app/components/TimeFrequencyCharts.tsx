// import React, {useEffect, useState, useCallback, useMemo} from 'react';

// import {Integration} from '@rfind-web/api-interfaces';
// import {BOTTOM_CHART_WIDTH, BOTTOM_CHART_HEIGHT, DEFAULT_REBINNED_FREQS, DEFAULT_SPECTROGRAM_VALUES} from "@rfind-web/const";

// import { UniformHeatmapDataSeries } from "scichart/Charting/Model/UniformHeatmapDataSeries";
// import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
// import { SciChartSurface } from "scichart/Charting/Visuals/SciChartSurface";
// import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
// import { EAxisAlignment } from "scichart/types/AxisAlignment";
// import { FastColumnRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastColumnRenderableSeries";
// import { NumberRange } from "scichart/Core/NumberRange";
// import { EAutoRange } from "scichart/types/AutoRange";
// import { HeatmapColorMap } from "scichart/Charting/Visuals/RenderableSeries/HeatmapColorMap";
// import { UniformHeatmapRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/UniformHeatmapRenderableSeries";

// interface TimeFrequencyChartsProps {
//     latestIntegration: Integration;
// }

// const divElementIdFftChart = "sciChart1";
// const divElementIdSpecgramChart = "sciChart2";


// const TimeFrequencyCharts: React.FC<TimeFrequencyChartsProps> = (props) => {
//     const {latestIntegration} = props;

//     // const latestIntegration = useMemo(()=>{
//     //     console.log("Got a new int")
//     //     return latestInt

//     // },[latestInt])

//     const drawCharts = async () => {

//         // const [fftChartInitialized, setFftChartInitialized] = useState<boolean>(false);
//         // const [specgramChartInitialized, setSpecgramChartInitialized] = useState<boolean>(false);
        
//         // const [fftXValues, setFftXValues] = useState<number[]>(DEFAULT_REBINNED_FREQS)
//         // const [spectrogramValues, setSpectrogramValues] = useState<number[][]>(DEFAULT_SPECTROGRAM_VALUES);

//         // const [fftDS, setFftDS] = useState<XyDataSeries>();
//         // const [spectrogramDS, setSpectrogramDS] = useState<UniformHeatmapDataSeries>();

//         // const updateAnalysers = useCallback((): void=> {

//         //     // Update FFT Chart
//         //     if (fftChartInitialized && fftDS){
//         //         fftDS.clear();
//         //         fftDS.appendRange(fftXValues, latestIntegration.bins);
//         //     }

//         //     // Update Spectrogram Chart
//         //     if (specgramChartInitialized && spectrogramDS){
//         //         spectrogramValues.shift();
//         //         spectrogramValues.push(latestIntegration.bins);
//         //         spectrogramDS.setZValues(spectrogramValues);
//         //     }
//         // },[fftChartInitialized, specgramChartInitialized, fftDS, fftXValues, latestIntegration, spectrogramValues, spectrogramDS])

//         const fftXValues: number[] = DEFAULT_REBINNED_FREQS;
//         let spectrogramValues: number[][] = DEFAULT_SPECTROGRAM_VALUES;

//         let fftDS: XyDataSeries;
//         let spectrogramDS: UniformHeatmapDataSeries;

//         let latestTime = new Date();

//         function updateAnalysers(frame: number): void {

//             console.log("In updateAnalysers", latestIntegration.time, latestTime)

//             if (latestIntegration.time !== latestTime){
//                 console.log("Actually going to update stuff")
    
//                 // Update FFT Chart
//                 fftDS.clear();
//                 fftDS.appendRange(fftXValues, latestIntegration.bins);
        
//                 // Update Spectrogram Chart
//                 spectrogramValues.shift();
//                 spectrogramValues.push(latestIntegration.bins);
//                 spectrogramDS.setZValues(spectrogramValues);

//                 latestTime = latestIntegration.time;
//             }
//         }

//         // const initFftChart = useCallback(async () => {
//         const initFftChart = async () => {
//             const { sciChartSurface, wasmContext } = await SciChartSurface.create(
//                 divElementIdFftChart,
//                 {
//                     widthAspect: BOTTOM_CHART_WIDTH,
//                     heightAspect: BOTTOM_CHART_HEIGHT
//                 }
//             );
//             const xAxis = new NumericAxis(wasmContext, {
//                 drawMajorTickLines: false,
//                 maxAutoTicks: 5,
//                 axisAlignment: EAxisAlignment.Top
//             });
//             sciChartSurface.xAxes.add(xAxis);

//             const yAxis = new NumericAxis(wasmContext, {
//                 axisAlignment: EAxisAlignment.Right,
//                 visibleRange: new NumberRange(-30, 70),
//                 growBy: new NumberRange(0.1, 0.1),
//                 drawMinorTickLines: false,
//                 drawMajorTickLines: false,
//                 maxAutoTicks: 5
//             });
//             sciChartSurface.yAxes.add(yAxis);

//             // setFftDS(new XyDataSeries(wasmContext));
//             fftDS = new XyDataSeries(wasmContext);

//             const rs = new FastColumnRenderableSeries(wasmContext, {
//                 stroke: "#E6E6FA",
//                 dataSeries: fftDS,
//                 zeroLineY: -30
//             });
//             sciChartSurface.renderableSeries.add(rs);

//             // setFftChartInitialized(true);

//             return sciChartSurface;
//         }
//         // },[fftDS]);

//         // SPECTROGRAM CHART
//         // const initSpectogramChart = useCallback(async () => {
//         const initSpectogramChart = async () => {

//             const { sciChartSurface, wasmContext } = await SciChartSurface.create(
//                 divElementIdSpecgramChart,
//                 {
//                     widthAspect: BOTTOM_CHART_WIDTH,
//                     heightAspect: BOTTOM_CHART_HEIGHT
//                 }
//             );

//             const xAxis = new NumericAxis(wasmContext, {
//                 autoRange: EAutoRange.Always,
//                 drawLabels: false,
//                 drawMinorTickLines: false,
//                 drawMajorTickLines: false
//             });
//             sciChartSurface.xAxes.add(xAxis);

//             const yAxis = new NumericAxis(wasmContext, {
//                 autoRange: EAutoRange.Always,
//                 drawLabels: false,
//                 drawMinorTickLines: false,
//                 drawMajorTickLines: false
//             });
//             sciChartSurface.yAxes.add(yAxis);

//             // setSpectrogramDS(
//             //     new UniformHeatmapDataSeries(wasmContext, {
//             //         xStart: 0,
//             //         xStep: 1,
//             //         yStart: 0,
//             //         yStep: 1,
//             //         zValues: spectrogramValues
//             //     })
//             // );
//             spectrogramDS = new UniformHeatmapDataSeries(wasmContext, {
//                 xStart: 0,
//                 xStep: 1,
//                 yStart: 0,
//                 yStep: 1,
//                 zValues: spectrogramValues
//             })

//             const rs = new UniformHeatmapRenderableSeries(wasmContext, {
//                 dataSeries: spectrogramDS,
//                 colorMap: new HeatmapColorMap({
//                     minimum: -30,
//                     maximum: 70,
//                     gradientStops: [
//                         { offset: 0, color: "#000000" },
//                         { offset: 0.0001, color: "#00008B" },
//                         { offset: 0.25, color: "#800080" },
//                         { offset: 0.5, color: "#FF0000" },
//                         { offset: 0.75, color: "#FFFF00" },
//                         { offset: 1, color: "#FFFFFF" }
//                     ]
//                 })
//             });
//             sciChartSurface.renderableSeries.add(rs);

//             // setSpecgramChartInitialized(true)

//             return sciChartSurface;
//         }
//         // },[spectrogramDS, spectrogramValues]);

//         const charts: SciChartSurface[] = [];
//         charts.push(await initFftChart());
//         charts.push(await initSpectogramChart());

//         // START ANIMATION
//         let timerId: NodeJS.Timeout;
//         let frameCounter = 0;
//         const updateChart = () => {
//             updateAnalysers(frameCounter++);
//             timerId = setTimeout(updateChart, 500);
//         };
//         updateChart();

//         return {charts}

//     }

    
//     useEffect(()=> {
//         let charts: SciChartSurface[];

//         drawCharts().then(result => {
//             charts = result.charts;
//         });
//         return () => {
//             // Ensure deleting charts on React component unmount
//             charts?.forEach(c => c.delete());
//         }
//     },[])

//     return (
//         <React.Fragment>
//             <div id={divElementIdFftChart} />
//             <div id={divElementIdSpecgramChart} />
//         </React.Fragment>

//     );
// }
// export default TimeFrequencyCharts
