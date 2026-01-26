import * as React from 'react';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import {
  TextBold24Regular,
  TextItalic24Regular,
  TextBulletList24Regular,
  TextNumberListLtr24Regular,
  ArrowUndo24Regular,
  ArrowRedo24Regular,
} from "@fluentui/react-icons";
import { cn } from "../../lib/utils";
import { useEffect } from "react";

const useStyles = makeStyles({
  container: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    padding: tokens.spacingHorizontalXS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  divider: {
    width: "1px",
    height: "20px",
    backgroundColor: tokens.colorNeutralStroke1,
    margin: `0 ${tokens.spacingHorizontalXS}`,
  },
  toggleActive: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const styles = useStyles();
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[100px] p-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(styles.container, className)}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <Button
          appearance="subtle"
          size="small"
          icon={<TextBold24Regular />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? styles.toggleActive : undefined}
          aria-label="Bold"
        />
        <Button
          appearance="subtle"
          size="small"
          icon={<TextItalic24Regular />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? styles.toggleActive : undefined}
          aria-label="Italic"
        />
        <div className={styles.divider} />
        <Button
          appearance="subtle"
          size="small"
          icon={<TextBulletList24Regular />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? styles.toggleActive : undefined}
          aria-label="Bullet List"
        />
        <Button
          appearance="subtle"
          size="small"
          icon={<TextNumberListLtr24Regular />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? styles.toggleActive : undefined}
          aria-label="Ordered List"
        />
        <div className={styles.divider} />
        <Button
          appearance="subtle"
          size="small"
          icon={<ArrowUndo24Regular />}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo"
        />
        <Button
          appearance="subtle"
          size="small"
          icon={<ArrowRedo24Regular />}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo"
        />
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:min-h-[100px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  );
};

export default RichTextEditor;
