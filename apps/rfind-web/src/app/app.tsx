import { useEffect, useState } from "react";
import {io} from "socket.io-client";
import {Message, Integration} from '@rfind-web/api-interfaces'
import {SOCKETIO_ENDPOINT} from "@rfind-web/const";
import FFTChart from "./components/FFTChart"
import {DEFAULT_FFT_VALUES} from '@rfind-web/const'


function App() {
  const [latestIntegration, setLatestIntegration] = useState<Integration>({time: new Date(), bins:DEFAULT_FFT_VALUES});

  useEffect(() => {
    console.log("setting up socket")
    const socket = io(SOCKETIO_ENDPOINT);
    socket.on("FromAPI", (data: Message) => {
      const time = new Date(data.timestamp)
      setLatestIntegration({time: time, bins: data.bins.map(Number)});
      console.log("got new data from api")
    });

    // CLEAN UP THE EFFECT
    return () => {
      socket.disconnect();
    };
  }, []);


  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', width: '100vw'}}>
    <p>
      At <time dateTime={latestIntegration?.time.toString()}>{latestIntegration?.time.toString()}</time> there were {latestIntegration?.bins.length} bins.
    </p>
    <FFTChart latestIntegration={latestIntegration} />
    </div>
  );
}

export default App;