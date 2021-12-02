import React, { useEffect, useState } from "react";
import {io} from "socket.io-client";
import {rebinMax} from '@rfind-web/utils'
import {Message, Integration} from '@rfind-web/api-interfaces'


const ENDPOINT = "http://localhost:4001";


interface ClientComponentProps {
}

const ClientComponent: React.FC<ClientComponentProps> = () => {
  const [response, setResponse] = useState<Integration>();

  useEffect(() => {
    const socket = io(ENDPOINT);
    socket.on("FromAPI", (data: Message) => {
      const time = new Date(data.timestamp)
      const digestableSpectra = rebinMax(data.bins, 0, -1, 1024)
      const temp = {time: time, bins: digestableSpectra}
      setResponse(temp);
    });

    // CLEAN UP THE EFFECT
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <p>
      At <time dateTime={response?.time.toString()}>{response?.time.toString()}</time> there were {response?.bins.length} bins.
    </p>
  );
}

export default ClientComponent