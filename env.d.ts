

interface ImportMetaEnv {
  readonly GEMINI_API_KEY: string;
  readonly DEMO_USERNAME: string;
  readonly DEMO_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
