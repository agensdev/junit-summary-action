declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_SERVICE_ACCOUNT: string | undefined;
      FIREBASE_STORAGE_BUCKET: string;
    }
  }
}

export {};
