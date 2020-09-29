import { getOptions } from 'loader-utils';
// import validateOptions from 'schema-utils';

// import schema from './options.json';

export const raw = true;

export default function loader(source) {
  const { version, webpack } = this;

  // eslint-disable-next-line no-unused-vars
  const options = getOptions(this) || {};

  // validateOptions(schema, options, 'Loader');

  const newSource = `
  /**
   * Loader API Version: ${version}
   * Is this in "webpack mode": ${webpack}
   */
  /**
   * Original Source From Loader
   */
  ${source}`;

  return `${newSource}`;
}
