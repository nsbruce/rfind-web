import React, {useState} from 'react';
import ClientComponent from './components/SocketClient';

function App() {
  const [loadClient, setLoadClient] = useState<boolean>(true);

  return (
    <>
      {/* LOAD OR UNLOAD THE CLIENT */}
      <button onClick={() => setLoadClient(prevState => !prevState)}>
        STOP CLIENT
      </button>
      {/* SOCKET IO CLIENT*/}
      {loadClient ? <ClientComponent /> : null}
    </>
  );
}

export default App;