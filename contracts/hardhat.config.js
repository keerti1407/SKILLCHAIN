import "dotenv/config";
import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com";

export default defineConfig({
  solidity: "0.8.28",
  networks: {
    mumbai: {
      type: "http",
      chainType: "l1",
      url: MUMBAI_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
});
