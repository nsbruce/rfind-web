import React, {useEffect, useState, useCallback, useMemo} from 'react';

import {Integration} from '@rfind-web/api-interfaces';
import {REBINNED_SPECTRA_SIZE, HZ_PER_DATA_POINT, BOTTOM_CHART_WIDTH, BOTTOM_CHART_HEIGHT, DEFAULT_REBINNED_FREQS} from "@rfind-web/const";

import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
import { SciChartSurface } from "scichart/Charting/Visuals/SciChartSurface";
import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
import { EAxisAlignment } from "scichart/types/AxisAlignment";
import { FastColumnRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastColumnRenderableSeries";
import { NumberRange } from "scichart/Core/NumberRange";
import { TSciChart } from "scichart/types/TSciChart";

interface FFTChartsProps {
    latestIntegration: Integration;
}

const divElementIdFftChart = "sciChart1";


const FFTChart: React.FC<FFTChartsProps> = (props) => {
    const {latestIntegration} = props;

    const [chartReady, setChartReady] = useState<boolean>(false);

    const [fftXValues, setFftXValues] = useState<number[]>(DEFAULT_REBINNED_FREQS)
    const [fftDS, setFftDS] = useState<XyDataSeries>();


    const fftYValues: number[] = useMemo(()=>{
        console.log("in useMemo fftY")

        if (chartReady && fftDS && latestIntegration.bins) {
            console.log("in useMemo fftY: updating data")
            fftDS.clear();
            console.log("cleared")
            fftDS.appendRange(fftXValues, latestIntegration.bins)                
            console.log("appended", latestIntegration.bins)
        }

        return latestIntegration.bins;

    },[fftXValues, latestIntegration.bins, fftDS, chartReady])


    const initFftChart = useCallback(async () => {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(
            divElementIdFftChart,
            {
                widthAspect: 0.5,
                heightAspect: 0.5

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
        console.log("initialized fftDS")
        setFftDS(new XyDataSeries(wasmContext, {xValues:fftXValues, yValues:[...Array(REBINNED_SPECTRA_SIZE).fill(0)]}));
        
        const rs = new FastColumnRenderableSeries(wasmContext, {
            stroke: "#E6E6FA",
            dataSeries: fftDS,
            zeroLineY: -30
        });
        sciChartSurface.renderableSeries.add(rs);
        
        
        
        setChartReady(true);
        return sciChartSurface;
    },[fftDS, fftXValues])



    
    useEffect(()=> {
        let chart: SciChartSurface;
        initFftChart().then(result => {
            chart = result;
        });
        return () => {
            // Ensure deleting charts on React component unmount
            chart.delete()
        }
    },[])

    return (
        <div id={divElementIdFftChart} style={{height:'30%'}} />

    );
}
export default FFTChart;
