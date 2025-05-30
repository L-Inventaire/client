import { fromBuffer } from "pdf2pic";
import { mkdirSync } from "fs";
import { cleanFiles, getTmpFile } from "../service";

export async function convertFromPdf(
  input: Buffer,
  options: {
    numberOfPages: number;
  }
): Promise<{ output: string[]; done: boolean }> {
  const pages: string[] = [];

  try {
    const pdfOptions = {
      density: 100,
      saveFilename: "output",
      savePath: getTmpFile(),
      format: "png",
    };
    mkdirSync(pdfOptions.savePath, { recursive: true });
    const storeAsImage = fromBuffer(input, pdfOptions);
    try {
      for (let i = 1; i <= options.numberOfPages; i++) {
        const image = await storeAsImage(i);
        pages.push(
          `${pdfOptions.savePath}/${pdfOptions.saveFilename}.${image.page}.${pdfOptions.format}`
        );
      }
    } catch (err) {
      if (!pages.length) {
        throw err;
      }
      //Just no more page to convert
    }
  } catch (error) {
    console.error(error);
    for (const file of pages) {
      cleanFiles([file]);
    }
    throw Error("Can't convert file with pdf-image.");
  }
  return { output: pages, done: true };
}
