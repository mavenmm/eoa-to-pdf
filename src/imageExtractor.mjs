import AdmZip from "adm-zip";
import path from "path";
import crypto from "crypto";
import fs from "fs";

export async function extractEoaImages(zipFilePath, images) {
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();

  for (let i = 0; i < zipEntries.length; i++) {
    const entry = zipEntries[i];

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

export async function extractLitmusImages(zipFilePath, images) {
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();

  for (let i = 0; i < zipEntries.length; i++) {
    const entry = zipEntries[i];

    if (
      (entry.entryName.endsWith(".png") || entry.entryName.endsWith(".jpg")) &&
      !entry.entryName.includes("-scaled700") &&
      !entry.entryName.includes("-thumb450") &&
      !path.basename(entry.entryName).startsWith("phantomjs")
    ) {
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
    } else {
      // Delete the unused file
      await fs.promises.unlink("./" + entry.entryName);
    }
  }
}
