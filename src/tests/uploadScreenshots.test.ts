import uploadScreenshots from "../utils/uploadScreenshots";
import { expect, jest, describe, beforeEach, it } from "@jest/globals";
import { getApps, getApp, App } from "firebase-admin/app";

// Mock the external modules
jest.mock("firebase-admin/app");

const mockedGetApps = getApps as jest.Mock<typeof getApps>;
const mockedGetApp = getApp as jest.Mock<typeof getApp>;
const mockApp: App = { name: "mock", options: {} };

jest.mock("firebase-admin/storage", () => ({
  getStorage: () => ({
    bucket: () => ({
      upload: jest.fn(),
      file: () => ({
        getSignedUrl: jest.fn(() =>
          Promise.resolve(["http://example.com/screenshot.png"])
        ),
      }),
    }),
  }),
}));

//Mock environment variables
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
  type: "service_account",
});
process.env.FIREBASE_STORAGE_BUCKET = "bucket-name";

describe("uploadScreenshots", () => {
  beforeEach(() => {
    // Setup the mocks before each test
    jest.resetAllMocks();
  });

  it("throws an error if the Firebase service account is missing", async () => {
    // Set environment variables to undefined to simulate the missing service account
    process.env.FIREBASE_SERVICE_ACCOUNT = undefined;
    mockedGetApps.mockReturnValue([]);
    await expect(
      uploadScreenshots(123, "/path/to/xcresult", "/path/to/screenshots")
    ).rejects.toThrow(
      "In order to upload, you have to set FIREBASE_STORAGE_BUCKET and FIREBASE_SERVICE_ACCOUNT in the environment variables."
    );

    // Reset the environment variables after the test
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      type: "service_account",
    });
  });

  it("successfully uploads screenshots and returns download URLs", async () => {
    mockedGetApps.mockReturnValue([mockApp]);
    mockedGetApp.mockReturnValue(mockApp);
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      type: "service_account",
    });
    process.env.FIREBASE_STORAGE_BUCKET = "bucket-name";

    // Run the function
    const result = await uploadScreenshots(
      123,
      undefined,
      "./src/tests/exampleFiles"
    );
    // Assert that the signed URL is returned
    expect(result).toEqual(
      expect.arrayContaining([
        {
          downloadUrl: "http://example.com/screenshot.png test",
          image: "src/tests/exampleFiles/ExampleUITeststestExample.jpg",
        },
      ])
    );
  }, 100000);

  it.skip("successfully extracts screenshots from xcresult file", async () => {
    mockedGetApps.mockReturnValue([mockApp]);
    mockedGetApp.mockReturnValue(mockApp);
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      type: "service_account",
    });
    process.env.FIREBASE_STORAGE_BUCKET = "bucket-name";

    // Run the function
    const result = await uploadScreenshots(
      123,
      "./src/tests/exampleFiles/exampleFail.xcresult",
      "./src/tests/exampleFiles/screenshots"
    );

    // Assert that the signed URL is returned
    expect(result).toEqual(
      expect.arrayContaining([
        {
          downloadUrl: "http://example.com/screenshot.png",
          image:
            "src/tests/exampleFiles/screenshots/Junit_Action_Summary_ExampleUITests/testExample()/fail_1_764337B3-1260-4C54-B4AD-5132E0982E4B.png",
        },
      ])
    );
  }, 100000);
});
