export const REBINNED_SPECTRA_SIZE = 1024;
export const HZ_PER_DATA_POINT = 600000/REBINNED_SPECTRA_SIZE;


const default_rebinned_freqs = new Array<number>(REBINNED_SPECTRA_SIZE);
for (let i = 0; i < REBINNED_SPECTRA_SIZE; i++) {
default_rebinned_freqs[i] = i * HZ_PER_DATA_POINT;
}

export const DEFAULT_REBINNED_FREQS = default_rebinned_freqs;

const default_spectrogram_values = new Array<number[]>(REBINNED_SPECTRA_SIZE);
for (let i = 0; i < REBINNED_SPECTRA_SIZE; i++) {
    default_spectrogram_values[i] = new Array<number>(REBINNED_SPECTRA_SIZE);
    for (let j = 0; j < REBINNED_SPECTRA_SIZE; j++) {
        default_spectrogram_values[i][j] = 0;
    }
}

export const DEFAULT_SPECTROGRAM_VALUES = default_spectrogram_values;