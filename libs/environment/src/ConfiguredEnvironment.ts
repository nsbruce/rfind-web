import { Environment, DEFAULT } from './Environment';

const environment: Environment = { ...DEFAULT };

Object.keys(DEFAULT).forEach((key: string) => {
  // ! NOTE: All environment variables have to be prefixed with NX_ in order for
  // ! nx to pass them through to the app from your .env file.  It is nicer however,
  // ! if our app can use values without the NX, so doing the concatenation in here
  const envValue = process.env[`NX_${key}`];
  if (envValue) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    environment[key] = envValue;
    // console.debug(`Replaced Environment Variable ${key}`);
  }
});


export default environment as Environment;
