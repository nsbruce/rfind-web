
export interface Environment {
  ZMQ_PORT: number;
  ZMQ_PROTOCOL: string;
  ZMQ_IP: string;
  PRODUCTION: boolean;
  SCICHART_RUNTIME_KEY:string;
  SOCKETIO_PORT: number;
  SOCKETIO_PROTOCOL: string;
  SOCKETIO_IP: string;
  START_FREQ: number;
  BANDWIDTH: number;
  SPECTRA_MAX_VALUE: number;
  SPECTRA_MIN_VALUE: number;
  INTEGRATION_RATE: number;
  SPECTRA_LENGTH: number;
  SPECTRA_REBINNED_LENGTH: number;
  DISPLAYED_TIME_LENGTH: number

}

export const DEFAULT: Environment = {
  ZMQ_PORT: 5557,
  ZMQ_PROTOCOL: 'tcp',
  ZMQ_IP: '127.0.0.1',
  PRODUCTION: false,
  SCICHART_RUNTIME_KEY: '',
  SOCKETIO_PORT: 4001,
  SOCKETIO_PROTOCOL: 'http',
  SOCKETIO_IP: 'localhost',
  START_FREQ: 0,
  BANDWIDTH: 2e9,
  SPECTRA_MAX_VALUE: 18,
  SPECTRA_MIN_VALUE: 14,
  INTEGRATION_RATE: 1,
  SPECTRA_LENGTH: 600000,
  SPECTRA_REBINNED_LENGTH: 1024,
  DISPLAYED_TIME_LENGTH: 100,
} as Environment;
