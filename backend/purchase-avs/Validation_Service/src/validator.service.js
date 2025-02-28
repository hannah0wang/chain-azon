require('dotenv').config();
const dalService = require("./dal.service");
const oracleService = require("./oracle.service");

async function validate(proofOfTask) {

  try {
      const taskResult = await dalService.getIPfsTask(proofOfTask);
      const ipfsHash = taskResult.ipfsHash;
      const zincHash = taskResult.zincHash;
      const result = await oracleService.compareReceipts(ipfsHash, zincHash);
      if (taskResult.result === result){
          return true;
      }
      return false;
    } catch (err) {
      console.error(err?.message);
      return false;
    }
  }
  
  module.exports = {
    validate,
  }