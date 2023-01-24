function depsLookup(deps, deploymentSet) {
  return deps.filter((dep) => !deploymentSet.has(dep));
}

function configTraverse({
  deploymentItemKey,
  deploymentStack,
  deploymentSet,
  deploymentConfig,
}) {
  if (deploymentSet.has(deploymentItemKey)) {
    return;
  }
  const deploymentItemConfig = deploymentConfig?.[deploymentItemKey];

  if (!deploymentItemConfig?.dependencies?.length) {
    deploymentStack.push(deploymentItemKey);
    deploymentSet.add(deploymentItemKey);
    return;
  }
  const depsNotInStack = depsLookup(deploymentItemConfig.dependencies, deploymentSet);
  if (depsNotInStack.length) {
    depsNotInStack.forEach((depKey) => {
      configTraverse({
        deploymentStack,
        deploymentSet,
        deploymentConfig,
        deploymentItemKey: depKey,
      })
    });
    deploymentStack.push(deploymentItemKey);
    deploymentSet.add(deploymentItemKey);
    return;
  }
  deploymentStack.push(deploymentItemKey);
  deploymentSet.add(deploymentItemKey);
  return;
}

module.exports = function createDeploymentStack(deploymentConfig) {
  const deploymentStack = [];
  const deploymentSet = new Set();
  const deploymentItemKeys = Object.keys(deploymentConfig);
  let i = 0;
  while (deploymentStack.length !== deploymentItemKeys.length) {
    const deploymentItemKey = deploymentItemKeys[i];
    configTraverse({
      deploymentItemKey,
      deploymentStack,
      deploymentSet,
      deploymentConfig,
    });
    i++;
  }
  return deploymentStack;
}