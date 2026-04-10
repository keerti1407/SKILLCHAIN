import hre from "hardhat";

async function main() {
  const skillChainFactory = await hre.ethers.getContractFactory("SkillChain");
  const skillChain = await skillChainFactory.deploy();
  await skillChain.waitForDeployment();

  console.log(`SkillChain deployed to: ${skillChain.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
