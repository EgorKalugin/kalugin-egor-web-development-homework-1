/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CATALOG_URL?: string
  readonly VITE_ORDERS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.svg' {
  const src: string
  export default src
}
