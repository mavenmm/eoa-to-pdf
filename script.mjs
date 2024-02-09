#!/usr/bin/env zx
import PDFDocument from "pdfkit";
import fs from "fs";
import AdmZip from "adm-zip";
import path from "path";
import sizeOf from "image-size";
import crypto from "crypto";

async function createPdf(images, output) {
  const pdfDoc = new PDFDocument({ autoFirstPage: false });
  const writeStream = fs.createWriteStream(output);
  pdfDoc.pipe(writeStream);

  for (let i = 0; i < images.length; i++) {
    const imgSize = sizeOf(images[i]);
    pdfDoc.addPage({ size: [imgSize.width, imgSize.height] });
    pdfDoc.image(images[i], 0, 0, {
      width: imgSize.width,
      height: imgSize.height,
    });
  }

  pdfDoc.end();
  return new Promise((resolve) => {
    writeStream.on("finish", resolve);
  });
}

async function unzipAndCollectImages(zipFilePath, images) {
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();

  zip.extractAllTo(/*target path*/ "./", /*overwrite*/ true);

  for (let i = 0; i < zipEntries.length; i++) {
    const entry = zipEntries[i];
    console.log(entry.entryName);
    if (entry.entryName.endsWith(".png") || entry.entryName.endsWith(".jpg")) {
      // Generate a hash for the current time
      const timestamp = Date.now();
      const hash = crypto
        .createHash("md5")
        .update(String(timestamp))
        .digest("hex");

      // Construct new filename with hash
      const ext = path.extname(entry.entryName);
      const name = path.basename(entry.entryName, ext);
      const newFilename = `${name}_${hash}${ext}`;

      // Rename the file with the new name
      await fs.promises.rename("./" + entry.entryName, "./" + newFilename);
      images.push("./" + newFilename);
    }
  }
}

// specify the directory you want to scan for zip files
const sourceDir = "./source";

// create a list to store image file paths
let images = [];

// go through each file in the source directory
let firstFilename = null;
for (const filename of fs.readdirSync(sourceDir)) {
  if (filename.endsWith(".zip")) {
    // construct full file path
    const filepath = path.join(sourceDir, filename);
    await unzipAndCollectImages(filepath, images);

    // store the first filename
    if (!firstFilename) {
      firstFilename = filename;
    }
  }
}

// get the current date
const date = new Date();
const formattedDate = `${date.getFullYear()}-${String(
  date.getMonth() + 1
).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// get the first 9 characters of the first filename and append the date
let output =
  firstFilename.substring(0, 9).toUpperCase() + "_" + formattedDate + ".pdf";

await createPdf(images, output);

// Delete the extracted images
for (let i = 0; i < images.length; i++) {
  await fs.promises.unlink(images[i]);
}
