const { createWebpackConfig } = require('valdi-web-devtools/webpack');

module.exports = createWebpackConfig({
  npmPackageName: 'valdi_widgets_web_npm',
  playgroundDir: __dirname,
  entry: './playground/main.ts',
});
