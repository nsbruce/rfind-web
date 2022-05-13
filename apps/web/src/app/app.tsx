import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Integration } from '@rfind-web/api-interfaces';
import env from '@rfind-web/environment';
import FFTChart from './components/FFTChart';
import TimestampDisplay from './components/TimestampDisplay';
import { DEFAULT_FFT_VALUES } from '@rfind-web/const';

function App() {
  const [latestIntegration, setLatestIntegration] = useState<Integration>({
    time: new Date(),
    bins: DEFAULT_FFT_VALUES,
  });

  useEffect(() => {
    const socket = io(
      env.SOCKETIO_PROTOCOL +
        '://' +
        env.SOCKETIO_IP +
        ':' +
        env.SOCKETIO_PORT +
        '/frontend'
    );
    socket.on('client', (data: Integration) => {
      setLatestIntegration({
        time: new Date(data.time),
        bins: data.bins.map((n) => Number(n / 100)),
      });
    });

    // CLEAN UP THE EFFECT
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'left',
      }}
    >
      <FFTChart latestIntegration={latestIntegration} />
      <TimestampDisplay date={latestIntegration.time} />
    </div>
  );
}

export default App;
