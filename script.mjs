#!/usr/bin/env zx
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import path from "path";
import { createPdf } from "./src/pdfCreator.mjs";
import { unzipAndCollectImages } from "./src/zipHandler.mjs";

// Parse command line arguments
const argv = yargs(hideBin(process.argv)).option("type", {
  alias: "t",
  type: "string",
  description: "Set process type",
}).argv;

// Get process type from command line arguments
const processType = argv.type || "eoa";

// specify the directory you want to scan for zip files
const sourceDir = "./source";

// create a list to store image file paths
let images = [];

// go through each file in the source directory
let outputName = "Combined";

// do this only if process type is 'eoa'
for (const filename of fs.readdirSync(sourceDir)) {
  if (filename.endsWith(".zip")) {
    // construct full file path
    const filepath = path.join(sourceDir, filename);
    await unzipAndCollectImages(filepath, images, processType);

    if (processType === "eoa") {
      // EOA only: store the first filename
      outputName = filename;
    }
  }
}

// get the current date
const date = new Date();
const formattedDate = `${date.getFullYear()}-${String(
  date.getMonth() + 1
).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Extract the original name based on EOA export
let firstPart = outputName.split("_")[0].toUpperCase();

let output = firstPart + "_" + formattedDate + ".pdf";

await createPdf(images, output);

// Delete the extracted images
for (let i = 0; i < images.length; i++) {
  await fs.promises.unlink(images[i]);
}
