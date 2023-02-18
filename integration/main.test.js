const { expect } = require("chai");
const { solBundler } = require('../index');
const deploymentConfig = require('../testData/deployment.config');

const deploy = () => solBundler({
  noLockFile: true,
  deploymentConfig,
})

describe('solBundler', () => {
  it('should deploy contracts based on config file', async () => {
    const [deploymentContracts, deploymentContext] = await deploy();
    expect(deploymentContracts).to.eql(["TestLibrary", "TestContract"]);
    expect(deploymentContext).to.have.property('TestContract');
    expect(deploymentContext).to.have.property('TestLibrary');
  });
})