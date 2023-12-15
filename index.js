const solBundler = require("./src/main");
const PluginsManager = require("./src/PluginsManager");

module.exports = {
  solBundler,
  Hooks: PluginsManager.Hooks,
};
