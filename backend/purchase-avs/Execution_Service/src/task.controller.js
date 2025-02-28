"use strict";

const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");
const axios = require("axios");


const router = Router()


// curl -X POST "http://localhost:8545/task/execute" \
//      -H "Content-Type: application/json" \
//      -d '{
//        "taskDefinitionId": 1,
//        "ipfsHash": "QmcMMfGrjA4xoTg4x7JpcwDq9qr8wPs92McWm7U5UrWrgN",
//        "zincHash": "QmVFiuaYZFkd4PTtWSZwBwTzoM1PbMQLh7SPoezbrk8TQ2"
//      }'

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);
        const ipfsHash = "QmcMMfGrjA4xoTg4x7JpcwDq9qr8wPs92McWm7U5UrWrgN";
        const zincHash = "QmVFiuaYZFkd4PTtWSZwBwTzoM1PbMQLh7SPoezbrk8TQ2";
        // const ipfsHash = req.body.ipfsHash;
        // const zincHash = req.body.zincHash;
        const result = await oracleService.compareReceipts(ipfsHash, zincHash);
        const publish = {
            result: result,
            ipfsHash: ipfsHash,
            zincHash: zincHash,
        };
        const cid = await dalService.publishJSONToIpfs(publish);
        await dalService.sendTask(cid, taskDefinitionId);
        return res.status(200).send(new CustomResponse({proofOfTask: cid, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})


module.exports = router
