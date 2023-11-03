import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { glob } from "glob";
import { exec } from "@actions/exec";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount =
  process.env.FIREBASE_SERVICE_ACCOUNT &&
  JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const uploadToStorage = serviceAccount && storageBucket;

if (uploadToStorage) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: storageBucket,
  });
}

async function uploadScreenshots(
  runId: number | undefined,
  xcresultPath: string | undefined,
  screenshotsPath: string | undefined = "./screenshots"
): Promise<Screenshot[]> {
  if (!serviceAccount) {
    throw new Error("Missing Firebase service account.");
  }

  if (!uploadToStorage) {
    throw new Error(
      "In order to upload, you have to set FIREBASE_STORAGE_BUCKET and FIREBASE_SERVICE_ACCOUNT in the environment variables."
    );
  }

  if (xcresultPath) {
    await getScreenshotsFromXcresult(
      xcresultPath,
      screenshotsPath || "./screenshots"
    );
  }

  const images = await glob("./screenshots/**/*.+(png|gif)");

  return await Promise.all(
    images.map(async (image) => {
      const downloadUrl = await upload(
        image,
        `${runId || "local"}/${image.replaceAll("./", "")}`
      );
      return { image, downloadUrl };
    })
  );
}

async function getScreenshotsFromXcresult(
  xcresultPath: string,
  destinationPath: string
) {
  await exec("brew install imagemagick --quiet");
  await exec("brew install chargepoint/xcparse/xcparse --quiet");
  await exec(`rm -r ${destinationPath}`);
  await exec(`xcparse screenshots --test ${xcresultPath} ${destinationPath}`);
  await exec(`${__dirname}/scripts/extract_screenshots.sh ${destinationPath}`);
}

async function upload(path: string, destinationPath: string): Promise<string> {
  const bucket = getStorage().bucket();
  await bucket.upload(path, { destination: destinationPath });
  const file = bucket.file(destinationPath);
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + 1);
  const signedUrls = await file.getSignedUrl({
    action: "read",
    expires: expireDate,
  });

  if (signedUrls.length > 0) {
    return signedUrls[0];
  } else {
    throw new Error("Could not upload screenshot");
  }
}

export default uploadScreenshots;
