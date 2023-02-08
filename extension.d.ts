/// <reference types="vite/client" />

declare module 'vue' {
  export * from '@vue/runtime-dom'
}

declare module '*.vue' {
  import { defineComponent } from 'vue'
  const component: ReturnType<typeof defineComponent>
  export default component
}
