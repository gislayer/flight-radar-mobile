const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push("gltf");
defaultConfig.resolver.assetExts.push("bin");
defaultConfig.resolver.assetExts.push("glb");

module.exports = defaultConfig;
