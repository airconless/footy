/// <reference types="./worker-configuration.d.ts" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AFL_API_KEY?: string;
    }
  }
}

interface Env {
  footykv: KVNamespace;
  DB: D1Database;
}

declare module "h3" {
  interface H3EventContext {
    cf: CfProperties;
    cloudflare: {
      request: Request;
      env: Env;
      context: ExecutionContext;
    };
  }
}

export {};
