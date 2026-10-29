const { createHmrConfig } = require('valdi-web-devtools/webpack');

module.exports = createHmrConfig({
  npmPackageName: 'valdi_widgets_web_npm',
  playgroundDir: __dirname,
  port: parseInt(process.env.PORT || '3030', 10),
});
