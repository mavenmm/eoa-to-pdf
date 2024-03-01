import AdmZip from "adm-zip";
import { extractEoaImages, extractLitmusImages } from "./imageExtractor.mjs";

export async function unzipAndCollectImages(zipFilePath, images, processType) {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(/*target path*/ "./", /*overwrite*/ true);

  // If process type is 'eoa' use extractEoaImages function
  if (processType === "eoa") {
    await extractEoaImages(zipFilePath, images);
    // If process type is 'litmus' use extractLitmusImages function
  } else if (processType === "litmus") {
    await extractLitmusImages(zipFilePath, images);
    // else return error for invalid process type
  } else {
    throw new Error(`Invalid process type: ${processType}`);
  }
}
