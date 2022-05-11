import numpy as np
import datetime
import h5py
from dateutil import tz
from dotenv import dotenv_values

from .generator import integrated_spec_gen

env = {
    **dotenv_values("../../.env"),
    **dotenv_values(".env")
}

'''
Time is in seconds
'''
def write_to_h5(noise_pwr, time):

    with h5py.File(env['H5_DATA_FILE'],'w') as h5f:
        n_integrations = np.ceil(time/t_int)

        start_times = datetime.datetime.now(tz=tz.tzstr('America/Vancouver')) - np.arange(n_integrations) * datetime.timedelta(seconds=1)

        start_timestamps=[int(t.timestamp()) for t in start_times[::-1]]



        h5f.create_dataset('spec', (n_integrations, const.NBINS), dtype=const.DTYPE)
        h5f.create_dataset('freqs', data=const.FULL_FREQS)
        h5f.create_dataset('times', data=start_timestamps)

        for i, output in enumerate(integrated_spec_gen(noise_pwr, time)):
            print(f"{i+1}/{n_integrations}")
            h5f['spec'][i]=output


if __name__ == "__main__":
    write_to_h5(1, 0.1)