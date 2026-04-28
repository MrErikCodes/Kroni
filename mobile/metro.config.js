const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
  // NativeWind's runtime is nested under nativewind/ because of the workspace's
  // tailwind v3 (mobile/nativewind) vs v4 (website) split. Surface it so Metro
  // can resolve "react-native-css-interop/jsx-runtime" from any module.
  path.resolve(workspaceRoot, 'node_modules/nativewind/node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: './global.css' });
