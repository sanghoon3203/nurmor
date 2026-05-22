const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;

config.watchFolders = [path.resolve(__dirname, '..')];
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
  sourceExts: [...resolver.sourceExts, 'svg'],
};

module.exports = config;
