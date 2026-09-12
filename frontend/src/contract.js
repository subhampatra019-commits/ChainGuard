import { ethers } from "ethers";
import ABI from "./ChainGuardABI.json";

export const CONTRACT_ADDRESS =
  "0xde26577df5a4F573dD2cD808A51747e1a547FF80";

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    signer
  );
};