import env from '@rfind-web/environment'

//Limits
export const SPECTRA_MIN_VALUE = Number(env.SPECTRA_MIN_VALUE); //dB amplitude
export const SPECTRA_MAX_VALUE = Number(env.SPECTRA_MAX_VALUE); //dB amplitude
export const INTEGRATION_RATE = Number(env.INTEGRATION_RATE); //seconds

//Sizes
export const FULL_SPECTRA_LENGTH = Number(env.SPECTRA_LENGTH);
export const FULL_SPECTRA_HZ_PER_BIN = Number(env.BANDWIDTH)/FULL_SPECTRA_LENGTH;
export const DISPLAYED_TIME_LENGTH = Number(env.DISPLAYED_TIME_LENGTH);
export const REBINNED_SPECTRA_LENGTH = Number(env.SPECTRA_REBINNED_LENGTH);

//Arrays
const full_freqs = new Array<number>(FULL_SPECTRA_LENGTH);
for (let i = Number(env.START_FREQ); i < FULL_SPECTRA_LENGTH; i++) {
    full_freqs[i] = i * FULL_SPECTRA_HZ_PER_BIN;
}
export const FULL_FREQS = full_freqs;
export const DEFAULT_FFT_VALUES = new Array(FULL_SPECTRA_LENGTH).fill(0)