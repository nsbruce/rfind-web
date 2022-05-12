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

from generator import integrated_spec_gen

env = {
    **dotenv_values("../../.env"),
    **dotenv_values(".env")
}
sio = socketio.Client(ssl_verify=True)#, logger=True, engineio_logger=True)

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

outMin = float(env['NX_SPECTRA_MIN_VALUE'])
outMax = float(env['NX_SPECTRA_MAX_VALUE'])
outDiff = outMax - outMin


g = integrated_spec_gen(1) # argument is noise power

while True:
    start = time.time()

    spec = next(g) #spec is linear and normalized to [0,1]
    spec *= 10**(outDiff/10)
    spec += 10**(outMin/10)

    print(f"Trying to send iteration")
    spec = np.array(1000.0*np.log10(spec)).astype(dtype=np.int16)

    ts = datetime.datetime.now().timestamp()*1000

    print('Max', np.max(spec), 'Min', np.min(spec))
    print("Data shape is", spec.shape)
    print("Memory size is", spec.nbytes/1000/1000, "MB")

    try: 
        print("-- Succeeded")
        sio.emit(event='integration', data={'bins': spec.tobytes(), 'timestamp':ts}, namespace=env['NX_SOCKETIO_BACKEND_NAMESPACE'])
    except:
        print("-- Failed")

    looptime = time.time()-start
    time.sleep(float(env['NX_INTEGRATION_RATE'])-looptime)
