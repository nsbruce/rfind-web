import numpy as np
import datetime
from dateutil import tz
from dotenv import dotenv_values

env = {
    **dotenv_values("../../.env"),
    **dotenv_values(".env")
}

##* What to simulate
# Carriers
fcs = [0.25e9, 0.85e9, 1e9, 1.2e9, 1.3e9, 1.55e9]

# FM signals
fms = [
    (0.3e9,200e3), #fc, bw
    (0.5e9,10e6),
    (0.9e9,10e6),
    (1.1e9,10e6),
    (1.25e9,35e6),
    (1.4e9,200e3),
    (1.5e9,20e6)
]

# Shift everything down because we're going to build a complex spectra
fcs = [fc-float(env['NX_BANDWIDTH'])/2 for fc in fcs]
fms = [(fc-float(env['NX_BANDWIDTH'])/2,bw) for fc,bw in fms]

# t_int = const.NBINS/const.FS # so that each fft is one integration
t_int = float(env['NX_INTEGRATION_RATE'])
nbins = int(env['NX_SPECTRA_LENGTH'])

def FM(fc, BW, t_arr):
    BW/=2
    fm = 1e5
    Am=1
    mt = Am*np.cos(2*np.pi*fm*t_arr)
    beta = BW/fm
    Ac=1
    st = Ac*np.exp(1j*(2*np.pi*fc*t_arr+beta*mt))
    return st


def integrated_spec_gen(noise_pwr) -> np.ndarray:
    t_incr = 0
    while True:
        t_arr = np.linspace(t_incr, t_incr+t_int, nbins)

        output = np.random.normal(0,np.sqrt(noise_pwr), nbins) + 1j*np.random.normal(0,np.sqrt(noise_pwr), nbins)

        for fc in fcs:
            output += np.exp(2j*np.pi*fc*t_arr)

        for fc, bw in fms:
            output += FM(fc,bw,t_arr)

        output = np.abs(np.fft.fftshift(np.fft.fft(output)))

        output /= np.max(output)

        yield output
        t_incr += t_int
