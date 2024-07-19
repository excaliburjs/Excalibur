declare global {
  namespace NodeJS {
    interface ProcessEnv {
      __EX_VERSION: string;
      NODE_ENV: string;
    }
  }
}

// satisfy TypeScript
export {};
