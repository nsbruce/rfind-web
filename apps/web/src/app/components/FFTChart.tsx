import React, { useEffect, useCallback, useRef } from 'react';

import { Integration } from '@rfind-web/api-interfaces';
import {
  FULL_FREQS,
  DEFAULT_FFT_VALUES,
  DISPLAYED_TIME_LENGTH,
  REBINNED_SPECTRA_LENGTH,
  SPECTRA_MIN_VALUE,
  SPECTRA_MAX_VALUE,
  INTEGRATION_RATE,
} from '@rfind-web/const';
import {
  rebinMax,
  largestTriangleThreeBuckets,
  number2SIString,
} from '@rfind-web/utils';

import { XyDataSeries } from 'scichart/Charting/Model/XyDataSeries';
import { SciChartSurface } from 'scichart/Charting/Visuals/SciChartSurface';
import {
  INumericAxisOptions,
  NumericAxis,
} from 'scichart/Charting/Visuals/Axis/NumericAxis';
import { EAxisAlignment } from 'scichart/types/AxisAlignment';
import { NumberRange } from 'scichart/Core/NumberRange';
import { FastLineRenderableSeries } from 'scichart/Charting/Visuals/RenderableSeries/FastLineRenderableSeries';
import { ZoomExtentsModifier } from 'scichart/Charting/ChartModifiers/ZoomExtentsModifier';
import { EXyDirection } from 'scichart/types/XyDirection';
import { RubberBandXyZoomModifier } from 'scichart/Charting/ChartModifiers/RubberBandXyZoomModifier';
import { EResamplingMode } from 'scichart/Charting/Numerics/Resamplers/ResamplingMode';
import { UniformHeatmapDataSeries } from 'scichart/Charting/Model/UniformHeatmapDataSeries';
import { UniformHeatmapRenderableSeries } from 'scichart/Charting/Visuals/RenderableSeries/UniformHeatmapRenderableSeries';
import { HeatmapColorMap } from 'scichart/Charting/Visuals/RenderableSeries/HeatmapColorMap';
import { zeroArray2D } from 'scichart/utils/zeroArray2D';
import { EDataChangeType } from 'scichart/Charting/Model/IDataSeries';
import { VisibleRangeChangedArgs } from 'scichart/Charting/Visuals/Axis/VisibleRangeChangedArgs';
import { SciChartVerticalGroup } from 'scichart/Charting/LayoutManager/SciChartVerticalGroup';
import { XAxisDragModifier } from 'scichart/Charting/ChartModifiers/XAxisDragModifier';
import { EDragMode } from 'scichart/types/DragMode';
import { RolloverModifier } from 'scichart/Charting/ChartModifiers/RolloverModifier';
import { SciChartSurfaceBase } from 'scichart/Charting/Visuals/SciChartSurfaceBase';
import TooltipDataTemplate from './Tooltip';

interface FFTChartsProps {
  latestIntegration: Integration;
}

const sharedYAxisProps: INumericAxisOptions = {
  axisAlignment: EAxisAlignment.Right,
  axisThickness: 20,
  axisTitleStyle: { fontSize: 16 },
};

const divElementIdFftChart = 'sciChart1';
const divElementIdSpectrogramChart = 'sciChart2';

const FFTChart: React.FC<FFTChartsProps> = (props) => {
  const { latestIntegration } = props;

  const fftDSref = useRef<XyDataSeries>();
  const spectrogramDSref = useRef<UniformHeatmapDataSeries>();
  const spectrogramValuesRef = useRef<number[][]>(
    zeroArray2D([DISPLAYED_TIME_LENGTH, REBINNED_SPECTRA_LENGTH])
  );
  const renderableFFT = useRef<FastLineRenderableSeries>();

  useEffect(() => {
    if (fftDSref.current) {
      fftDSref.current.clear();
      fftDSref.current.appendRange(FULL_FREQS, latestIntegration.bins);
    }
    const currentIdxs = renderableFFT.current?.getIndicesRange(
      renderableFFT.current.xAxis.visibleRange
    );
    if (spectrogramDSref.current) {
      spectrogramValuesRef.current.shift();
      // spectrogramValuesRef.current.push(rebinMax(latestIntegration.bins,currentIdxs?.min || 0, currentIdxs?.max || -1,REBINNED_SPECTRA_LENGTH))
      spectrogramValuesRef.current.push(
        largestTriangleThreeBuckets(
          latestIntegration.bins.slice(
            currentIdxs?.min || 0,
            currentIdxs?.max || -1
          ),
          REBINNED_SPECTRA_LENGTH
        )
      );

      spectrogramDSref.current.notifyDataChanged(EDataChangeType.Append); //TODO Check whether this type should be update
    }
  }, [latestIntegration.bins]);

  const enforceZoomConstraint = useCallback(
    (data: VisibleRangeChangedArgs | undefined) => {
      if (data) {
        const initialIdxs = renderableFFT.current?.getIndicesRange(
          data.visibleRange
        );

        let nextIdxs = initialIdxs;
        if (
          renderableFFT.current &&
          initialIdxs &&
          initialIdxs?.diff < REBINNED_SPECTRA_LENGTH
        ) {
          const middleIdx = Math.round((initialIdxs.max + initialIdxs.min) / 2);
          nextIdxs = new NumberRange(
            middleIdx - REBINNED_SPECTRA_LENGTH / 2,
            middleIdx + REBINNED_SPECTRA_LENGTH / 2
          );
          renderableFFT.current.xAxis.visibleRange = new NumberRange(
            FULL_FREQS[nextIdxs.min],
            FULL_FREQS[nextIdxs.max]
          );
        }
      }
    },
    []
  );

  const initFftChart = useCallback(async () => {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(
      divElementIdFftChart
    );

    const xAxis = new NumericAxis(wasmContext, {
      drawMajorTickLines: false,
      axisAlignment: EAxisAlignment.Top,
      visibleRangeLimit: new NumberRange(
        FULL_FREQS[0],
        FULL_FREQS[FULL_FREQS.length - 1]
      ),
    });
    xAxis.labelProvider.formatLabel = number2SIString;
    xAxis.visibleRangeChanged.subscribe(enforceZoomConstraint);
    sciChartSurface.xAxes.add(xAxis);

    const yAxis = new NumericAxis(wasmContext, {
      visibleRange: new NumberRange(SPECTRA_MIN_VALUE, SPECTRA_MAX_VALUE),
      axisTitle: 'Pwr. (dBm/Hz)',
      ...sharedYAxisProps,
    });
    sciChartSurface.yAxes.add(yAxis);

    fftDSref.current = new XyDataSeries(wasmContext, {
      xValues: FULL_FREQS,
      yValues: DEFAULT_FFT_VALUES,
      dataIsSortedInX: true,
      dataEvenlySpacedInX: true,
      containsNaN: false,
    });

    renderableFFT.current = new FastLineRenderableSeries(wasmContext, {
      stroke: '#E6E6FA',
      dataSeries: fftDSref.current,
      resamplingMode: EResamplingMode.Max,
    });
    sciChartSurface.renderableSeries.add(renderableFFT.current);

    sciChartSurface.chartModifiers.add(
      new ZoomExtentsModifier({
        isAnimated: true,
        xyDirection: EXyDirection.XDirection,
      })
    );
    sciChartSurface.chartModifiers.add(
      new RubberBandXyZoomModifier({
        xyDirection: EXyDirection.XDirection,
        isAnimated: true,
      })
    );
    sciChartSurface.chartModifiers.add(
      new XAxisDragModifier({
        dragMode: EDragMode.Panning,
      })
    );
    sciChartSurface.chartModifiers.add(new RolloverModifier({
      tooltipDataTemplate: TooltipDataTemplate,
    }));
    if (renderableFFT.current) {
      renderableFFT.current.rolloverModifierProps.tooltipColor =
        SciChartSurfaceBase.DEFAULT_THEME.labelBackgroundBrush;
    }
    return sciChartSurface;
  }, [enforceZoomConstraint]);

  const initSpectogramChart = useCallback(async () => {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(
      divElementIdSpectrogramChart
    );

    const xAxis = new NumericAxis(wasmContext, {
      drawLabels: false,
    });
    sciChartSurface.xAxes.add(xAxis);

    const yAxis = new NumericAxis(wasmContext, {
      axisTitle: 'Time passed (s)',
      ...sharedYAxisProps,
    });
    yAxis.labelProvider.formatLabel = (dataValue: number) => {
      let label = Math.abs(dataValue - DISPLAYED_TIME_LENGTH);
      label *= INTEGRATION_RATE; //seconds
      return label.toFixed(0);
    };
    sciChartSurface.yAxes.add(yAxis);

    spectrogramDSref.current = new UniformHeatmapDataSeries(wasmContext, {
      xStart: 0,
      xStep: 1,
      yStart: 0,
      yStep: 1,
      zValues: spectrogramValuesRef.current,
    });
    const rs = new UniformHeatmapRenderableSeries(wasmContext, {
      resamplingMode: EResamplingMode.None,
      dataSeries: spectrogramDSref.current,
      colorMap: new HeatmapColorMap({
        minimum: SPECTRA_MIN_VALUE,
        maximum: SPECTRA_MAX_VALUE,
        gradientStops: [
          { offset: 0, color: '#000000' },
          { offset: 0.0001, color: '#00008B' },
          { offset: 0.25, color: '#800080' },
          { offset: 0.5, color: '#FF0000' },
          { offset: 0.75, color: '#FFFF00' },
          { offset: 1, color: '#FFFFFF' },
        ],
      }),
    });
    sciChartSurface.renderableSeries.add(rs);

    return sciChartSurface;
  }, []);

  const initCharts = useCallback(async () => {
    const charts = [];
    charts.push(await initFftChart());
    charts.push(await initSpectogramChart());

    return charts;
  }, [initFftChart, initSpectogramChart]);

  useEffect(() => {
    let charts: SciChartSurface[];
    const verticalGroup = new SciChartVerticalGroup(); // The vertical group aligns the charts
    initCharts().then((result) => {
      charts = result;

      // The following line is needed to fix the charts' alignment
      result.forEach((c) => verticalGroup.addSurfaceToGroup(c));
    });
    return () => {
      // Ensure deleting charts on React component unmount
      charts?.forEach((c) => c.delete());
    };
  }, []);

  return (
    <>
      <div
        id={divElementIdFftChart}
        style={{ height: '30vh', width: '100vw' }}
      />
      <div
        id={divElementIdSpectrogramChart}
        style={{ height: '70vh', width: '100vw' }}
      />
    </>
  );
};
export default FFTChart;
