import logging
import multiprocessing
import time
import uuid

import ostore
import ostore.notifications
import ostore.notification_daemon

import numpy as np
from dateutil.parser import isoparse
import os
import re

import socketio
import numpy as np
import time
from dotenv import dotenv_values

env = {
    **dotenv_values("../../.env"),
    **dotenv_values(".env")
}

prev_dt = None
spec    = np.zeros((16, 37500))
count   = 0

# Disable the WERKZEUG logging, which is very distracting.
logging.getLogger('werkzeug').disabled = True
os.environ['WERKZEUG_RUN_MAIN'] = 'true'

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
topic_config = ostore.TopicConfig(env['NX_DELIVERY_CLIENT_IP'], int(env['NX_S3_PORT']))
manager = ostore.NotificationManager(config, topic_config)
manager.add_notification(ostore.NotificationConfig(''))

queue = multiprocessing.Queue()
daemon = ostore.daemon_factory(topic_config, queue)
shutdown = multiprocessing.Event()
multiprocessing.Process(target=daemon, args=(shutdown,)).start()

# make sure the notification daemon has started
time.sleep(1.0)

logging.info(time.asctime())

logging.info('uploading object: %s', object_name)
storage.put(object_name, ostore.Object(b''))
logging.info('upload complete')
time.sleep(1.0)
if queue.qsize() == 0:
    logging.info('queue has no data when upload completes')
    print()
    print('notifications ARE PROBABLY ASYNCHRONOUS')
    print()
else:
    logging.info('queue has data when upload completes')
    print()
    print('notifications ARE PROBABLY NOT ASYNCHRONOUS')
    print()

def callback_function(key):

    match = re.search(env['NX_S3_REGEX'], key)

    if match:

        ts = match.group(1)
        dt = isoparse(ts)
        sl = int(match.group(2))
        ch = int(match.group(3))
        if (ch == 1):
            sl += 8 

        if(prev_dt is not None):

            if (dt-prev_dt).total_seconds() > 0:

                if (dt-prev_dt).total_seconds() > 1:
                    print("-- Dropped Data?")

                full_spec = np.roll(np.reshape(spec*100, -1), -18750)[60000:-60000].astype('int16').tobytes()

                try:
                    sio.emit(event='integration', data={'bins': full_spec, 'timestamp':ts}, namespace=env['NX_SOCKETIO_BACKEND_NAMESPACE'])
                    print("-- Succeeded: " + ts + ' ' + str(count))
                except Exception as e:
                    print("-- Failed %s" %(e))
                prev_dt = dt
                count = 0

            data = np.frombuffer(storage.get(key).data, dtype=np.int64).astype('float32')
            spec[sl] = 10.*np.log10(data[1250:-1250])
            count += 1

        else:

            prev_dt = dt


try:
    while True:
        callback_function(queue.get())
except KeyboardInterrupt:
    pass

print('cleaning up')
shutdown.set()
storage.delete(object_name)
manager.cleanup()


##
## END OF CODE
##
