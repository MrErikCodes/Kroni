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

module.exports = config;
