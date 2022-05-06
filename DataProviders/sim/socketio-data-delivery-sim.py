# Python version: 3.9.1
# Description: SocketIO data delivery script
#
# h5py==3.1.0
# python-socketio==5.4.1
# python-dotenv==0.17.1
# msgpack-numpy==0.4.7.1
# numpy==1.22.2
#

import socketio
import numpy as np
import h5py
import datetime
import time
from dotenv import dotenv_values

env = {
    **dotenv_values("../../.env"),
    **dotenv_values(".env")
}
sio = socketio.Client(ssl_verify=False)#, logger=True, engineio_logger=True)

@sio.event
def connect():
    print('I connected to the server')

@sio.event
def connect_error(data):
    print("Connecting to the server failed")

@sio.event
def disconnect():
    print("I am disconnected from the server")

sioAddr = env['NX_SOCKETIO_PROTOCOL']+'://'+env['NX_SOCKETIO_IP']+':'+env['NX_SOCKETIO_PORT']

sio.connect(sioAddr, namespaces=[env['NX_SOCKETIO_BACKEND_NAMESPACE']])

with h5py.File(env['H5_DATA_FILE'],'r') as h5f:
    modlen = len(h5f['times'])
    i=0
    while True:
        print(f"Trying to send iteration {i}")
        spec = 10.*np.log10(h5f['spec'][i % modlen]).astype('float32')
        if int(env['NX_SPECTRA_LENGTH']) < spec.shape[0]:
            spec = spec[:int(env['NX_SPECTRA_LENGTH'])]
        ts = datetime.datetime.now().timestamp()*1000

        # print('Size',sys.getsizeof(spec.tobytes())/1024, 'kB')
        try: 
            print("-- Succeeded")
            sio.emit(event='integration', data={'bins': spec.tobytes(), 'timestamp':ts}, namespace=env['NX_SOCKETIO_BACKEND_NAMESPACE'])
        except:
            print("-- Failed")

        i+=1
        time.sleep(int(env['NX_INTEGRATION_RATE']))
