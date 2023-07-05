import ffmpeg from "fluent-ffmpeg";
import {Readable} from "stream";

export function convertBase64StringToReadStream(
  base64String: string
): Readable {
  const buffer = Buffer.from(base64String, "base64");
  return Readable.from(buffer);
}

export async function writeWebmToMp4(
  input: string | Readable,
  output: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions("-c:v libx264")
      .outputOptions("-c:a aac")
      .outputOptions("-strict -2")
      .outputOptions("-q:v 0")
      .save(output)
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
