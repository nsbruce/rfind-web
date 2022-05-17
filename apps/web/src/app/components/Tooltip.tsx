import { number2SIString } from '@rfind-web/utils';
import { SeriesInfo } from 'scichart/Charting/Model/ChartData/SeriesInfo';
import { RolloverModifierRenderableSeriesProps } from 'scichart/Charting/Visuals/RenderableSeries/RolloverModifier/RolloverModifierRenderableSeriesProps';

const TooltipDataTemplate: RolloverModifierRenderableSeriesProps["tooltipDataTemplate"] = (seriesInfo: SeriesInfo, tooltipTitle: string, tooltipLabelX: string, tooltipLabelY: string) => {
    const content = `${number2SIString(seriesInfo.xValue, true)}, ${seriesInfo.formattedYValue} dBm/Hz`

    return [content]
}

export default TooltipDataTemplate