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
fcs = [25e6, 85e6, 41e6, 900e6, -400e6, -401e6, -402e6]
phase_incrs = [0]*len(fcs)

# FM signals
fms = [
    (-900e6,200e3), #fc, bw
    (-915e6,200e3),
    (-925e6,200e3),
    (-935e6,200e3),
    (-950e6,200e3),
    (-550e6,20e6),
    (375e6,35e6)
]

limited_noises=[]
sweeps=[]

# t_int = const.NBINS/const.FS # so that each fft is one integration
t_int = int(env['NX_INTEGRATION_RATE'])
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


def integrated_spec_gen(noise_pwr, duration) -> np.ndarray:
    t_incr = 0

    while t_incr <= duration:
        t_arr = np.linspace(t_incr, t_incr+t_int, nbins)

        output = np.random.normal(0,np.sqrt(noise_pwr), nbins) + 1j*np.random.normal(0,np.sqrt(noise_pwr), nbins)

        for fc in fcs:
            output += np.exp(2j*np.pi*fc*t_arr)
        for fc, bw in fms:
            output += FM(fc,bw,t_arr)

        output = 10.*np.log10(np.abs(np.fft.fftshift(np.fft.fft(output))))

        yield output.astype(np.int16)
        t_incr += t_int
    return
