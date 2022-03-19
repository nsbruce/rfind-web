import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import env from '@rfind-web/environment';
import { SciChartSurface } from 'scichart';
import App from './app/app';

if (env.PRODUCTION) {
  SciChartSurface.setRuntimeLicenseKey(env.SCICHART_RUNTIME_KEY)
}

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
);
