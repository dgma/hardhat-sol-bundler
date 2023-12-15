const main = require("./src/main");
const PluginsManager = require("./src/PluginsManager");

module.exports = {
  main,
  Hooks: PluginsManager.Hooks,
};
