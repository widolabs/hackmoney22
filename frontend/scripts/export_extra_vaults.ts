/* eslint-disable @typescript-eslint/no-var-requires */
const { extraVaults } = require("../distlib/index").default;
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");

function exportVaultsToFile() {
  fs.writeFileSync("/tmp/extra_vaults.json", JSON.stringify(extraVaults));
}

function uploadJsonObjectToGoogleCloudStorage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  const stringDate = [year, month, day].join("_");

  const bucket = "wido_jsb";
  const storage = new Storage();
  const bucketObj = storage.bucket(bucket);
  const fileObj = bucketObj.file(`vaults/extra_vaults_${stringDate}.json`);
  const options = {
    destination: fileObj,
  };

  const upload = bucketObj.upload("/tmp/extra_vaults.json", options);
  upload.then((data) => {
    console.log(data);
  });
}

exportVaultsToFile();
uploadJsonObjectToGoogleCloudStorage();
