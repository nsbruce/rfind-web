import React, { useCallback, useEffect, useState } from "react";
import {io} from "socket.io-client";
import {rebinMax} from '@rfind-web/utils'
import {Message, Integration} from '@rfind-web/api-interfaces'
// import TimeFrequencyCharts from "./components/TimeFrequencyCharts";
import {SOCKETIO_ENDPOINT} from "@rfind-web/const";
import FFTChart from "./components/FFTChart"
import {DEFAULT_FFT_VALUES} from '@rfind-web/const'
import {NumberArray} from 'scichart/types/NumberArray'


function App() {
  const [latestIntegration, setLatestIntegration] = useState<Integration>({time: new Date(), bins:DEFAULT_FFT_VALUES});

  useEffect(() => {
    console.log("setting up socket")
    const socket = io(SOCKETIO_ENDPOINT);
    socket.on("FromAPI", (data: Message) => {
      const time = new Date(data.timestamp)
      // const digestableSpectra = rebinMax(data.bins, 0, -1, 1024)
      // setLatestIntegration({time: time, bins: digestableSpectra});
      setLatestIntegration({time: time, bins: data.bins.map(Number)});
      console.log("got new data from api")
    });

    // CLEAN UP THE EFFECT
    return () => {
      socket.disconnect();
    };
  }, []);


  return (
    <div style={{display:'flex', flexDirection:'column', height:'95vh'}}>
    <p>
      At <time dateTime={latestIntegration?.time.toString()}>{latestIntegration?.time.toString()}</time> there were {latestIntegration?.bins.length} bins.
    </p>
    {/* <TimeFrequencyCharts latestIntegration={latestIntegration} /> */}
    <FFTChart latestIntegration={latestIntegration} />
    </div>
  );
}

export default App;