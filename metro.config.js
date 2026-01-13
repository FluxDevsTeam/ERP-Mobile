const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// This line is the "bridge" that makes styles work
module.exports = withNativeWind(config, { input: "./global.css" });