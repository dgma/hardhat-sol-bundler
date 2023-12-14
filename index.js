const solBundler = require("./src/solBundler");
const PluginsManager = require("./src/PluginsManager");

module.exports = {
  solBundler,
  Hooks: PluginsManager.Hooks,
};
