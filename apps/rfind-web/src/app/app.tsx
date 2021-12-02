import React, { useCallback, useEffect, useState } from "react";
import {io} from "socket.io-client";
import {rebinMax} from '@rfind-web/utils'
import {Message, Integration} from '@rfind-web/api-interfaces'
import TimeFrequencyCharts from "./components/TimeFrequencyCharts";
// import ClientComponent from './components/SocketClient';

const ENDPOINT = "http://localhost:4001";




function App() {
  const [latestIntegration, setLatestIntegration] = useState<Integration>({});
  const [socketIsOpen, setSocketIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const socket = io(ENDPOINT);
    setSocketIsOpen(socket.connected)
    socket.on("FromAPI", (data: Message) => {
      const time = new Date(data.timestamp)
      const digestableSpectra = rebinMax(data.bins, 0, -1, 1024)
      const temp = {time: time, bins: digestableSpectra}
      setLatestIntegration(temp);
    });

    // CLEAN UP THE EFFECT
    return () => {
      socket.disconnect();
      setSocketIsOpen(socket.connected)
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