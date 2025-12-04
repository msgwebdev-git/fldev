"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  Highlighter,
  Type,
  FileText,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  shortcut?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  tooltip,
  shortcut,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isActive ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{tooltip}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Начните писать...",
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [htmlContent, setHtmlContent] = useState(content);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[400px] p-4 focus:outline-none prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange(html);
      setHtmlContent(html);
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt("URL изображения:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleHtmlChange = (html: string) => {
    setHtmlContent(html);
    onChange(html);
  };

  const switchToVisual = () => {
    if (editor) {
      editor.commands.setContent(htmlContent);
    }
    setMode("visual");
  };

  const switchToHtml = () => {
    if (editor) {
      setHtmlContent(editor.getHTML());
    }
    setMode("html");
  };

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white animate-pulse">
        <div className="h-12 bg-gray-50 border-b border-gray-200" />
        <div className="h-[400px]" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Mode tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-2">
          <Tabs
            value={mode}
            onValueChange={(v) => {
              if (v === "visual") switchToVisual();
              else switchToHtml();
            }}
          >
            <TabsList className="bg-transparent h-10">
              <TabsTrigger
                value="visual"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5"
              >
                <Type className="w-4 h-4" />
                Визуальный
              </TabsTrigger>
              <TabsTrigger
                value="html"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5"
              >
                <Code className="w-4 h-4" />
                HTML
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500 pr-2">
            <span>{wordCount} слов</span>
            <span>{charCount} символов</span>
          </div>
        </div>

        {mode === "visual" ? (
          <>
            {/* Toolbar */}
            <div className="border-b border-gray-200 bg-white p-1.5 flex flex-wrap items-center gap-0.5">
              {/* Text formatting */}
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                tooltip="Жирный"
                shortcut="Ctrl+B"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                tooltip="Курсив"
                shortcut="Ctrl+I"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                tooltip="Подчёркнутый"
                shortcut="Ctrl+U"
              >
                <UnderlineIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                tooltip="Зачёркнутый"
              >
                <Strikethrough className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                isActive={editor.isActive("highlight")}
                tooltip="Выделение"
              >
                <Highlighter className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Headings */}
              <ToolbarButton
                onClick={() => editor.chain().focus().setParagraph().run()}
                isActive={editor.isActive("paragraph")}
                tooltip="Параграф"
              >
                <Pilcrow className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor.isActive("heading", { level: 1 })}
                tooltip="Заголовок 1"
              >
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor.isActive("heading", { level: 2 })}
                tooltip="Заголовок 2"
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                isActive={editor.isActive("heading", { level: 3 })}
                tooltip="Заголовок 3"
              >
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Alignment */}
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                isActive={editor.isActive({ textAlign: "left" })}
                tooltip="По левому краю"
              >
                <AlignLeft className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                isActive={editor.isActive({ textAlign: "center" })}
                tooltip="По центру"
              >
                <AlignCenter className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                isActive={editor.isActive({ textAlign: "right" })}
                tooltip="По правому краю"
              >
                <AlignRight className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                isActive={editor.isActive({ textAlign: "justify" })}
                tooltip="По ширине"
              >
                <AlignJustify className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Lists */}
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                tooltip="Маркированный список"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                tooltip="Нумерованный список"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                tooltip="Цитата"
              >
                <Quote className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                tooltip="Разделитель"
              >
                <Minus className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* Links & Media */}
              <ToolbarButton
                onClick={addLink}
                isActive={editor.isActive("link")}
                tooltip="Ссылка"
                shortcut="Ctrl+K"
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>
              {editor.isActive("link") && (
                <ToolbarButton
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  tooltip="Удалить ссылку"
                >
                  <Unlink className="w-4 h-4" />
                </ToolbarButton>
              )}
              <ToolbarButton onClick={addImage} tooltip="Изображение">
                <ImageIcon className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarDivider />

              {/* History */}
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                tooltip="Отменить"
                shortcut="Ctrl+Z"
              >
                <Undo className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                tooltip="Повторить"
                shortcut="Ctrl+Y"
              >
                <Redo className="w-4 h-4" />
              </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
          </>
        ) : (
          /* HTML Mode */
          <Textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="min-h-[450px] font-mono text-sm border-0 rounded-none resize-none focus-visible:ring-0"
            placeholder="<p>HTML код...</p>"
          />
        )}
      </div>
    </TooltipProvider>
  );
}
