/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL_ENDPOINT: string
  readonly VITE_PRIMEUI_LICENSE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
