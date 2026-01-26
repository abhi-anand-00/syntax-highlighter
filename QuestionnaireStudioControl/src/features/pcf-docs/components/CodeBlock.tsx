/**
 * Code Block Component for PCF Documentation
 * 
 * Self-contained syntax highlighting component.
 */

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { makeStyles, tokens } from '@fluentui/react-components';
import { Copy16Regular, Checkmark16Regular } from '@fluentui/react-icons';
import * as React from 'react';
import { useState } from 'react';

const useStyles = makeStyles({
  container: {
    position: 'relative',
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalM,
  },
  copyButton: {
    position: 'absolute',
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalS,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: tokens.borderRadiusSmall,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: tokens.fontSizeBase200,
    transition: 'all 0.15s ease',
    zIndex: 10,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'rgba(255, 255, 255, 0.9)',
    },
  },
  copied: {
    color: '#4ade80',
  },
  languageBadge: {
    position: 'absolute',
    top: tokens.spacingVerticalS,
    left: tokens.spacingHorizontalM,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    zIndex: 10,
  },
});

const customStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    margin: 0,
    borderRadius: '8px',
    padding: '2.5rem 1rem 1rem 1rem',
    fontSize: '13px',
    lineHeight: '1.6',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    fontSize: '13px',
    lineHeight: '1.6',
  },
};

interface CodeBlockProps {
  code: string;
  language?: 'typescript' | 'tsx' | 'javascript' | 'json' | 'xml' | 'bash' | 'text';
  showLineNumbers?: boolean;
}

export const CodeBlock = ({ 
  code, 
  language = 'typescript',
  showLineNumbers = false 
}: CodeBlockProps) => {
  const styles = useStyles();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageLabels: Record<string, string> = {
    typescript: 'ts',
    tsx: 'tsx',
    javascript: 'js',
    json: 'json',
    xml: 'xml',
    bash: 'bash',
    text: 'text',
  };

  return (
    <div className={styles.container}>
      <span className={styles.languageBadge}>
        {languageLabels[language] || language}
      </span>
      <button 
        className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <Checkmark16Regular />
            Copied!
          </>
        ) : (
          <>
            <Copy16Regular />
            Copy
          </>
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        showLineNumbers={showLineNumbers}
        wrapLines
        customStyle={{
          margin: 0,
          borderRadius: '8px',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
