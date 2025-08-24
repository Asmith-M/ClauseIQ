
// Rename this file to postcss.config.cjs to work with "type": "module" in package.json
// This file should be named postcss.config.cjs, not .js, for CommonJS syntax to work.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
