//Sizes
export const FULL_SPECTRA_LENGTH = 600000;
export const FULL_SPECTRA_HZ_PER_BIN = 2000000/FULL_SPECTRA_LENGTH;
export const DISPLAYED_TIME_LENGTH = 100;
export const REBINNED_SPECTRA_LENGTH = 1024;

//Limits
export const SPECTRA_MIN_VALUE = 14;
export const SPECTRA_MAX_VALUE = 18;

//Arrays
const full_freqs = new Array<number>(FULL_SPECTRA_LENGTH);
for (let i = 0; i < FULL_SPECTRA_LENGTH; i++) {
    full_freqs[i] = i * FULL_SPECTRA_HZ_PER_BIN;
}
export const FULL_FREQS = full_freqs;
export const DEFAULT_FFT_VALUES = new Array(FULL_SPECTRA_LENGTH).fill(0)