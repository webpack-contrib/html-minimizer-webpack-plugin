import serialize from 'serialize-javascript';

import { transform } from '../src/minify';

import { normalizeErrors } from './helpers';

describe('worker', () => {
  it('should minify html', async () => {
    const options = {
      name: 'entry.html',
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizerOptions: { removeComments: false },
    };
    const { code } = await transform(serialize(options));

    expect(code).toMatchSnapshot('html');
  });

  it('should minify html', async () => {
    const options = {
      name: 'entry.html',
      input: '<!-- Comment --><p title="blah" id="moo">     foo     </p>',
      minimizerOptions: { removeComments: false },
      minify: () => {
        return {
          html:
            '<!-- From minify function --><p class="atata">from-minify-function</p>',
        };
      },
    };
    const { code } = await transform(serialize(options));

    expect(code).toMatchSnapshot('html');
  });

  it('should emit error', async () => {
    const options = {
      name: 'entry.html',
      input: false,
    };

    try {
      await transform(serialize(options));
    } catch (error) {
      const normalizeError = { ...error };

      normalizeError.message = [error.message.split('\n')];

      expect(normalizeErrors(normalizeError.message)).toMatchSnapshot('error');
    }
  });
});
