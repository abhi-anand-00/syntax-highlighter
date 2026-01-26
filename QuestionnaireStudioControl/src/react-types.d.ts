import type * as React from 'react';

// Type declarations for react-syntax-highlighter (PCF build compatibility)
declare module 'react-syntax-highlighter' {
  import type { FC, CSSProperties, HTMLAttributes, ElementType, RefAttributes } from 'react';
  
  interface SyntaxHighlighterProps {
    children: string;
    language?: string;
    style?: Record<string, CSSProperties>;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    customStyle?: CSSProperties;
    codeTagProps?: HTMLAttributes<HTMLElement>;
    lineNumberStyle?: CSSProperties | ((lineNumber: number) => CSSProperties);
    startingLineNumber?: number;
    lineProps?: HTMLAttributes<HTMLElement> | ((lineNumber: number) => HTMLAttributes<HTMLElement>);
    PreTag?: ElementType;
    CodeTag?: ElementType;
    useInlineStyles?: boolean;
  }
  
  export const Prism: FC<SyntaxHighlighterProps>;
  export const Light: FC<SyntaxHighlighterProps>;
  const SyntaxHighlighter: FC<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  import type { CSSProperties } from 'react';
  const oneDark: Record<string, CSSProperties>;
  const vscDarkPlus: Record<string, CSSProperties>;
  const tomorrow: Record<string, CSSProperties>;
  const prism: Record<string, CSSProperties>;
  export { oneDark, vscDarkPlus, tomorrow, prism };
}

declare module 'react-syntax-highlighter/dist/esm/styles/hljs' {
  import type { CSSProperties } from 'react';
  const vs2015: Record<string, CSSProperties>;
  const docco: Record<string, CSSProperties>;
  export { vs2015, docco };
}

// Ensure JSX namespace is available for PCF builds
export {};

declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type IntrinsicElements = React.JSX.IntrinsicElements;
  }
}
