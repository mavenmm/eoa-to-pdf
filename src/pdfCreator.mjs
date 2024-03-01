import PDFDocument from "pdfkit";
import fs from "fs";
import sizeOf from "image-size";

export async function createPdf(images, output) {
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
