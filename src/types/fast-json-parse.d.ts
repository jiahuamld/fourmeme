declare module 'fast-json-parse' {
  function Parse(data: string): { err: Error | null; value: any };
  export default Parse;
} 