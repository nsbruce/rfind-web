import multiprocessing
import uuid
import warnings

import ostore
import rastro.data_feed
import rastro.time_prefix
import Calibration

import numpy as np
from dateutil.parser import isoparse
import re

import socketio
import numpy as np
from dotenv import dotenv_values

env = {
    **dotenv_values("../../.env"),
    **dotenv_values(".env")
}

def get_keys(storage, queue, key_prefix):
    generator = rastro.time_prefix.TimePrefixGenerator(5.0, 'seconds')

    keys = rastro.data_feed.keys_from_prefixes(
        storage,
        rastro.data_feed.add_prefix(
            key_prefix, generator.generate_prefixes(multiprocessing.Event())
        )
    )
    for key in keys:
        queue.put(key)


prev_dt = None
spec    = np.zeros((16, 37500))
count   = 0
freq_hz = np.linspace(0e6, 2000e6, 600000)

noise_on_fname = 'noise_on.dat'
noise_off_fname = 'noise_off.dat'

p_on    = np.fromfile(noise_on_fname, dtype=np.float32)
p_off   = np.fromfile(noise_off_fname, dtype=np.float32)
coeffs  = Calibration.get_cal_coeffs(freq_hz, p_on, p_off)

inCalCycle = False
savedOnCal = True
savedOffCal = True

sio = socketio.Client(ssl_verify=True) #, logger=True, engineio_logger=True)

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


object_name = 'test-object-from-script-' + str(uuid.uuid4())

config = ostore.Config.load(env['NX_S3_CONFIG_JSON'])
storage = ostore.ObjectStore(config)
key_queue = multiprocessing.Queue()

key_streamer = multiprocessing.Process(
    target=get_keys, args=(storage, key_queue, "rfind")
)
key_streamer.start()

while True:

    key = key_queue.get()
    match = re.search(env['NX_S3_REGEX'], key)

    if match:

        timestamp = match.group(1)
        timeObj = isoparse(timestamp)
        sl = int(match.group(2))
        ch = int(match.group(3))
        if (ch == 1):
            sl += 8 
        
        # Decide whether to save new calibration data or use the existing one
        if timeObj.minute == 1 and not inCalCycle and not savedOnCal:
            inCalCycle = True
            savedOnCal = False #Already set to false but still valid
            savedOffCal = False # Already set to false but still valid
        if timeObj.minute > 3 and (not savedOnCal or not savedOffCal):
            raise warnings.Warning('Calibration cycle ended and calibrations were not saved')

        if sl in np.arange(2,15):
            if(prev_dt is not None):

                if (timeObj-prev_dt).total_seconds() > 0:

                    if (timeObj-prev_dt).total_seconds() > 1:
                        print("-- Dropped Data?")

                    full_spec = np.roll(np.reshape(spec, -1), -18750)

                    if inCalCycle and timeObj.minute == 1 and not savedOnCal:
                        # Save uncalibrated spectrum
                        p_on = full_spec.astype(np.float32)
                        p_on.tofile(noise_on_fname)
                        savedOnCal = True
                    if inCalCycle and timeObj.minute == 2 and not savedOffCal:
                        p_off = full_spec.astype(np.float32)
                        p_off.tofile(noise_off_fname)
                        savedOffCal = True
                    if timeObj.minute == 3 and inCalCycle:
                        coeffs = Calibration.get_cal_coeffs(freq_hz, p_on, p_off)
                        inCalCycle = False
                        savedOnCal = False # resetting for next time
                        savedOffCal = False # resetting for next time


                    full_spec = Calibration.apply_cal(full_spec, coeffs)
                    full_spec = (1000*np.log10(full_spec/0.001))[60000:-60000].astype('int16').tobytes()

                    try:
                        sio.emit(event='integration', data={'bins': full_spec, 'timestamp':timestamp}, namespace=env['NX_SOCKETIO_BACKEND_NAMESPACE'])
                        print("-- Succeeded: " + timestamp + ' ' + str(count))
                    except Exception as e:
                        print("-- Failed %s" %(e))
                    prev_dt = timeObj
                    count = 0

                data = np.frombuffer(storage.get(key).data, dtype=np.int64).astype('float32')
                spec[sl] = 10.*np.log10(data[1250:-1250])
                count += 1

            else:

                prev_dt = timeObj




##
## END OF CODE
##
