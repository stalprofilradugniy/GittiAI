const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

const isWatchMode = process.argv.includes('--watch');
const distDir = path.join(__dirname, 'dist');

// --- DIAGNOSTIC LOG ---
console.log('isWatchMode:', isWatchMode, 'argv:', process.argv);
// --- END DIAGNOSTIC LOG ---

// Ensure the dist directory exists and is clean before build
fs.emptyDirSync(distDir);

// Copy index.html and metadata.json to dist
fs.copySync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
fs.copySync(path.join(__dirname, 'metadata.json'), path.join(distDir, 'metadata.json'));

// Adapt the script path in the copied dist/index.html
let htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
// Regex matches the specific script tag for bundle.js
htmlContent = htmlContent.replace(/<script type="module" src="dist\/bundle.js"><\/script>/, '<script type="module" src="bundle.js"></script>');
fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

const commonBuildOptions = {
  entryPoints: [path.join(__dirname, 'src', 'index.tsx')],
  bundle: true,
  outfile: path.join(distDir, 'bundle.js'),
  minify: !isWatchMode,
  sourcemap: isWatchMode ? 'inline' : false,
  platform: 'browser',
  format: 'esm',
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY_FOR_BUILD || ''),
    'process.env.NODE_ENV': JSON.stringify(isWatchMode ? 'development' : 'production'),
  },
  logLevel: 'info', // General esbuild logging
};

if (isWatchMode) {
  const watchLoggerPlugin = {
    name: 'watch-logger',
    setup(build) {
      let buildCount = 0;
      build.onStart(() => {
        if (buildCount > 0) { // Don't log "rebuild" for the very first build
            console.log(`Rebuild starting (change detected)...`);
        }
        buildCount++;
      });
      build.onEnd(result => {
        if (result.errors && result.errors.length > 0) {
          console.error('Watch build failed. Errors:');
          result.errors.forEach(err => console.error(`  ${err.text} (at ${err.location?.file}:${err.location?.line}:${err.location?.column})`));
        } else {
          console.log('Watch build succeeded. Reload your browser.');
          if (result.warnings && result.warnings.length > 0) {
            console.warn('Build warnings:');
            result.warnings.forEach(warn => console.warn(`  ${warn.text} (at ${warn.location?.file}:${warn.location?.line}:${warn.location?.column})`));
          }
        }
      });
    },
  };

  esbuild.context({
    ...commonBuildOptions,
    plugins: [watchLoggerPlugin], // Add plugins to context
  }).then(async (ctx) => {
    console.log('esbuild is watching for changes...');
    await ctx.watch(); // This starts the watch mode and keeps the process alive
  }).catch((err) => {
    console.error('Failed to initialize esbuild watch context:', err);
    process.exit(1);
  });

} else {
  // Standard one-off build
  esbuild.build(commonBuildOptions)
    .then(() => {
      console.log('Build successful!');
    })
    .catch((err) => {
      console.error('Build failed:', err);
      process.exit(1);
    });
}