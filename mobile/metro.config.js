const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Keep hierarchical lookup ON so Metro walks into nested node_modules dirs
// (e.g. react-native/node_modules/@react-native/virtualized-lists).
// Workspace-with-overrides puts several deps at non-root paths and the
// hierarchical walk is the only resolution that finds them all without
// per-package metro hacks.
config.resolver.disableHierarchicalLookup = false;

// Force every "react" / "react-dom" import — including subpaths like
// "react/jsx-runtime" — to resolve to mobile's own nested copy. The
// renderer bundled inside react-native must pair with the exact same
// react instance; the hoisted root copy from a sibling workspace will
// not match and throws 'Incompatible React versions' at startup.
//
// extraNodeModules is only a fallback when normal resolution fails, so it
// can't override Metro's hierarchical walk. resolveRequest is run before
// the default resolver and lets us redirect deterministically.
const path_ = path;
const upstreamResolveRequest = config.resolver.resolveRequest;
const REACT_PINS = new Map([
  ['react', path_.resolve(projectRoot, 'node_modules/react')],
  ['react-dom', path_.resolve(projectRoot, 'node_modules/react-dom')],
]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const [pkg, root] of REACT_PINS) {
    if (moduleName === pkg) {
      return context.resolveRequest(context, root, platform);
    }
    if (moduleName.startsWith(`${pkg}/`)) {
      const subpath = moduleName.slice(pkg.length + 1);
      return context.resolveRequest(context, path_.join(root, subpath), platform);
    }
  }
  if (typeof upstreamResolveRequest === 'function') {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
