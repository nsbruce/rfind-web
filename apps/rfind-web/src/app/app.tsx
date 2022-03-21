import { useEffect, useState } from "react";
import {io} from "socket.io-client";
import {Message, Integration} from '@rfind-web/api-interfaces'
import env from "@rfind-web/environment";
import FFTChart from "./components/FFTChart"
import {DEFAULT_FFT_VALUES} from '@rfind-web/const'


function App() {
  const [latestIntegration, setLatestIntegration] = useState<Integration>({time: new Date(), bins:DEFAULT_FFT_VALUES});

  useEffect(() => {
    const socket = io(env.SOCKETIO_PROTOCOL+'://'+env.SOCKETIO_APP_IP+':'+env.SOCKETIO_PORT);
    socket.on("integration", (data: Message) => {
      const time = new Date(data.timestamp)
      setLatestIntegration({time: time, bins: data.bins.map(Number)});
    });

    // CLEAN UP THE EFFECT
    return () => {
      socket.disconnect();
    };
  }, []);


  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', width: '100vw'}}>
    {/* <p>
      At <time dateTime={latestIntegration?.time.toString()}>{latestIntegration?.time.toString()}</time> there were {latestIntegration?.bins.length} bins.
    </p> */}
    <FFTChart latestIntegration={latestIntegration} />
    </div>
  );
}

export default App;