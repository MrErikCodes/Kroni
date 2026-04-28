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

// Pin react + react-dom to mobile's nested copy so the renderer bundled
// inside react-native@0.81 (which pairs with react@19.1.0) doesn't get
// shadowed by a higher 19.2.x copy that some sibling workspace hoisted
// to root. Wrong pairing throws 'Incompatible React versions' at startup.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

module.exports = config;
