// src/types/svg.d.ts
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?raw' {
  const content: string;
  export default content;
}
