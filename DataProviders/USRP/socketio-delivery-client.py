# Python version: 3.8.10
# Description: SocketIO data delivery script
#
# python-socketio==5.5.2
# python-dotenv==0.20.0
# numpy==1.22.2
# websocket-client==1.2.1
#
# uhd with python api installed from source at v4.1.0.5
#

import socketio
import numpy as np
import datetime
import time
from dotenv import dotenv_values
import uhd
import time

env = {
    **dotenv_values(".env"),
    **dotenv_values("../../.env")
}

# extract relevant env variables
fs = float(env['NX_BANDWIDTH'])
integration_rate = float(env['NX_INTEGRATION_RATE'])
f0=float(env['NX_START_FREQ'])
f1=f0+fs
fc=(f0+f1)/2
nfft = int(env['NX_SPECTRA_LENGTH'])

# Setup socketio
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
print("Connecting to api at",sioAddr)

sio.connect(sioAddr, namespaces=[env['NX_SOCKETIO_BACKEND_NAMESPACE']])

# Setup device
usrp = uhd.usrp.MultiUSRP()
usrp.set_rx_rate(fs,0)
usrp.set_rx_freq(fc, 0)
usrp.set_rx_gain(15,0)

# Set up stream and rx buffer
num_samps = nfft
samples = np.empty((1,num_samps), dtype=np.complex64)

st_args = uhd.usrp.StreamArgs("fc32", "sc16")
st_args.channels = [0]

metadata = uhd.types.RXMetadata()
streamer = usrp.get_rx_stream(st_args)
buffer_samps = streamer.get_max_num_samps()
recv_buffer = np.zeros((1,buffer_samps), dtype=np.complex64) # dtype here correlates with the "fc32" stream arg

# Start stream
stream_cmd = uhd.types.StreamCMD(uhd.types.StreamMode.start_cont)
stream_cmd.stream_now = True
streamer.issue_stream_cmd(stream_cmd)

# Setup PSD
def psd(samples):
    window = np.hamming(len(samples))
    result = np.multiply(window, samples)
    result = np.fft.fftshift(np.fft.fft(result, nfft))
    # Multiply by extra 100 so we can int it later
    result = np.abs(np.nan_to_num(1000.0 * np.log10(np.square(np.abs(result)))))
    result = np.abs(result)
    return result

# Receive samples and transmit
try:
    while True:
        start = time.time()
        recv_samps = 0
        while recv_samps < num_samps:
            samps = streamer.recv(recv_buffer, metadata)
            if metadata.error_code != uhd.types.RXMetadataErrorCode.none:
                print(metadata.strerror())
            if samps:
                real_samps = min(num_samps-recv_samps, samps)
                samples[:,recv_samps:recv_samps+real_samps] = recv_buffer[:,0:real_samps]
                recv_samps += real_samps
        # Compute PSD
        bins = psd(samples).astype(np.int16)
        
        # Log useful stuff
        # print('Max', np.max(bins[:]), 'Min', np.min(bins[:]))
        # print("Data shape is", bins.shape)
        # print("Memory size is", bins.nbytes/1000/1000, "MB")

        # Get timestamp (to be removed)
        ts = datetime.datetime.now().timestamp()*1000
        # Send to api
        sio.emit(event='integration', data={'bins': bins.tobytes(), 'timestamp':ts}, namespace=env['NX_SOCKETIO_BACKEND_NAMESPACE'])
        looptime = time.time()-start
        time.sleep(integration_rate-looptime)




except KeyboardInterrupt:
    pass

stream_cmd = uhd.types.StreamCMD(uhd.types.StreamMode.stop_cont)
streamer.issue_stream_cmd(stream_cmd)