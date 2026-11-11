/* Use a modern installed runtime even when an old system Node shadows it. */
const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');
let runtime = process.execPath;
if (Number(process.versions.node.split('.')[0]) < 20) {
  const root = path.join(os.homedir(), '.nvm/versions/node');
  const versions = fs.existsSync(root) ? fs.readdirSync(root).filter(v => Number(v.slice(1).split('.')[0]) >= 20).sort((a, b) => b.localeCompare(a, undefined, { numeric: true })) : [];
  if (!versions.length) { console.error('Node.js 20.9+ is required.'); process.exit(1); }
  runtime = path.join(root, versions[0], 'bin/node');
}
const action = process.argv[2] || 'dev';
const env = Object.assign({}, process.env, { NEXT_TELEMETRY_DISABLED: '1', PATH: path.dirname(runtime) + path.delimiter + process.env.PATH });
function run(file, args) {
  const result = cp.spawnSync(runtime, [file].concat(args || []), { stdio: 'inherit', env: env });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
if (action === 'assets' || action === 'build') {
  run(path.join(__dirname, 'acquire-nasa-models.mjs'));
  run(path.join(__dirname, 'generate-assets.mjs'));
}
if (action === 'assets') process.exit(0);
if (action === 'test') { run(path.join(__dirname, 'verify-archive.mjs')); run(path.join(__dirname, 'verify-hydration.mjs')); }
else if (action === 'typecheck') run(require.resolve('typescript/bin/tsc'), ['--noEmit']);
// Webpack avoids Turbopack's CSS worker socket restriction in hardened environments.
else run(require.resolve('next/dist/bin/next'), [action].concat(action === 'dev' ? ['--webpack', '--hostname', '0.0.0.0'] : action === 'build' ? ['--webpack'] : []));
