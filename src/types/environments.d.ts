declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_SERVICE_ACCOUNT: string;
      FIREBASE_STORAGE_BUCKET: string;
    }
  }
}

export {};
