import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { glob } from "glob";
import { exec } from "@actions/exec";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config();

function firebaseServiceAccount() {
  try {
    return (
      process.env.FIREBASE_SERVICE_ACCOUNT &&
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    );
  } catch (error) {
    return undefined;
  }
}

function initializeFirebase() {
  if (getApps().length === 0) {
    const serviceAccount = firebaseServiceAccount();

    if (!serviceAccount || !process.env.FIREBASE_STORAGE_BUCKET) {
      throw new Error(
        "In order to upload, you have to set FIREBASE_STORAGE_BUCKET and FIREBASE_SERVICE_ACCOUNT in the environment variables."
      );
    }

    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  return getApp(); // returns the initialized app
}

async function uploadScreenshots(
  runId: number | undefined,
  xcresultPath: string | undefined,
  screenshotsPath: string | undefined = "./screenshots"
): Promise<Screenshot[]> {
  const app = initializeFirebase();
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  const uploadToStorage = app && storageBucket;

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

  const images = await glob(`${screenshotsPath}/**/*.+(png|gif|jpg)`, {});

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
  const actionPath = process.env.GITHUB_ACTION_PATH;
  const scriptPath = path.join(
    actionPath || "",
    "scripts/extract_screenshots.sh"
  );

  await exec("brew install imagemagick --quiet");
  await exec("brew install chargepoint/xcparse/xcparse --quiet");
  await exec(`rm -rf ${destinationPath}`);
  await exec(`xcparse screenshots --test ${xcresultPath} ${destinationPath}`);
  await exec(`${scriptPath} ${destinationPath}`);
}

async function upload(path: string, destinationPath: string): Promise<string> {
  initializeFirebase();
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
