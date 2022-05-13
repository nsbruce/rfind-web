import React from 'react';

import { Integration } from '@rfind-web/api-interfaces';
import { SciChartSurfaceBase } from 'scichart/Charting/Visuals/SciChartSurfaceBase';

interface TimestampDisplayProps {
  date: Integration['time'];
}

const TimestampDisplay: React.FC<TimestampDisplayProps> = (props) => {
  const { date } = props;

  return (
    <div
      style={{
        backgroundColor:
          SciChartSurfaceBase.DEFAULT_THEME.legendBackgroundBrush,
        borderColor: SciChartSurfaceBase.DEFAULT_THEME.gridBorderBrush,
        borderWidth: 1,
        borderStyle: 'solid',
        color: SciChartSurfaceBase.DEFAULT_THEME.textAnnotationForeground,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontSize: 14,
        textAlign: 'center',
        padding: 10,
        borderRadius: 10,
        zIndex: 10,
        position: 'absolute',
        left: 50,
        bottom: 50,
      }}
    >
      {`${date.toDateString()} ` +
        `${date.getHours()}` +
        `:` +
        `${date.getMinutes()}`.padStart(2, '0') +
        `:` +
        `${date.getSeconds()}`.padStart(2, '0') +
        `.` +
        `${date.getMilliseconds()}`.padStart(3, '0')}
    </div>
  );
};

export default TimestampDisplay;
