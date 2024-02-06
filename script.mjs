#!/usr/bin/env zx
import PDFDocument from "pdfkit";
import fs from "fs";
import AdmZip from "adm-zip";
import path from "path";
import sizeOf from "image-size";

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

async function unzipAndCreatePdf(zipFilePath) {
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();
  const images = [];

  zip.extractAllTo(/*target path*/ "./", /*overwrite*/ true);

  for (let i = 0; i < zipEntries.length; i++) {
    const entry = zipEntries[i];
    console.log(entry.entryName);
    if (entry.entryName.endsWith(".png") || entry.entryName.endsWith(".jpg")) {
      images.push("./" + entry.entryName);
    }
  }

  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const output =
    path.basename(zipFilePath, ".zip") + "_" + formattedDate + ".pdf";
  await createPdf(images, output);

  // Delete the extracted images
  for (let i = 0; i < images.length; i++) {
    fs.unlinkSync(images[i]);
  }
}

await unzipAndCreatePdf(process.argv[3]);
