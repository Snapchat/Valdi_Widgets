const path = require('path');
const fs = require('fs');
const { createStaticServer } = require('valdi-web-devtools/test_utils/static_server');

const PORT = parseInt(process.env.PORT || '3030', 10);
const DIST_DIR = process.env.VALDI_WIDGETS_DIST_DIR || 'dist';

const runfiles = process.env.RUNFILES_DIR || process.env.RUNFILES;
if (!runfiles) {
  console.error('ERROR: RUNFILES_DIR not set. Run via: bazel run //web_playground:serve');
  process.exit(1);
}

const packageDir = path.join(runfiles, '_main/web_playground');
const playgroundDir = path.join(packageDir, 'playground');
const distDir = path.join(packageDir, DIST_DIR);

for (const dir of [playgroundDir, distDir]) {
  if (!fs.existsSync(dir)) {
    console.error(`ERROR: ${dir} not found in runfiles`);
    process.exit(1);
  }
}

const server = createStaticServer({
  staticDirs: [distDir, playgroundDir],
  spaRoutes: [],
});

server.listen(PORT, () => {
  console.log(`Valdi Widgets web playground (${DIST_DIR}) running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});
