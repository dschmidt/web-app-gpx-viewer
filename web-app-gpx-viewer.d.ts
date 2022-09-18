declare module 'vue/types/web-app-gpx-viewer' {
  interface Vue {
    [key: string]: any
  }
}

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.css';
