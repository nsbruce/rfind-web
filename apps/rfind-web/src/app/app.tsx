import React, { useCallback, useEffect, useState } from "react";
import {io} from "socket.io-client";
import {rebinMax} from '@rfind-web/utils'
import {Message, Integration} from '@rfind-web/api-interfaces'
import TimeFrequencyCharts from "./components/TimeFrequencyCharts";
import {SOCKETIO_ENDPOINT} from "@rfind-web/const";
// import ClientComponent from './components/SocketClient';

const DEFAULT_INTEGRATION:Integration = {bins:[...Array(1024)], time: new Date()}


function App() {
  const [latestIntegration, setLatestIntegration] = useState<Integration>(DEFAULT_INTEGRATION);

  useEffect(() => {
    const socket = io(SOCKETIO_ENDPOINT);
    socket.on("FromAPI", (data: Message) => {
      const time = new Date(data.timestamp)
      const digestableSpectra = rebinMax(data.bins, 0, -1, 1024)
      const temp = {time: time, bins: digestableSpectra}
      setLatestIntegration(temp);
    });

    // CLEAN UP THE EFFECT
    return () => {
      socket.disconnect();
    };
  }, []);


  return (
    <>
    <p>
      At <time dateTime={latestIntegration?.time.toString()}>{latestIntegration?.time.toString()}</time> there were {latestIntegration?.bins.length} bins.
    </p>
    <TimeFrequencyCharts latestIntegration={latestIntegration} />
    </>
  );
}

export default App;