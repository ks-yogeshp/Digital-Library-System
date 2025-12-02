/* eslint-env node */

function quoteWrapped(filenames) {
  return filenames.map((f) => `'${f}'`).join(' ');
}

module.exports = {
  '*.{js,ts,vue,jsx,tsx,json,css,scss}': (filenames) => `
  npx --no-install prettier ${quoteWrapped(filenames)}
  `,

  '*.{js,ts}': (filenames) =>
    `npx --no-install eslint -- ${quoteWrapped(filenames)}`,
};
