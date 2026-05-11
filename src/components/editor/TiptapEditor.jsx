"use client";

import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {Placeholder} from "@tiptap/extension-placeholder";

import { TextStyle } from "@tiptap/extension-text-style";

import {Color} from "@tiptap/extension-color";
import {TextAlign} from "@tiptap/extension-text-align";
import {Underline} from "@tiptap/extension-underline";
import {Highlight} from "@tiptap/extension-highlight";

import { Table } from "@tiptap/extension-table";

import { TableRow } from "@tiptap/extension-table-row";

import { TableHeader } from "@tiptap/extension-table-header";

import { TableCell } from "@tiptap/extension-table-cell";

import {HorizontalRule} from "@tiptap/extension-horizontal-rule";

import {Youtube} from "@tiptap/extension-youtube";

export default function TiptapEditor({
  content,
  onChange,
}) {

  const editor = useEditor({
    extensions: [

      StarterKit,

      Image.configure({
        inline: false,
        allowBase64: true,
      }),

      Link.configure({
        openOnClick: false,
      }),

      Placeholder.configure({
        placeholder: "Write your article...",
      }),

      TextStyle,
      Color,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Underline,

      Highlight,

      HorizontalRule,

      Table.configure({
        resizable: true,
      }),
      
      TableRow,
      TableHeader,
      TableCell,

      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],

    content: content || "",

    immediatelyRender: false,

    editorProps: {
      attributes: {
        class:"min-h-[400px] border border-gray-300 rounded-2xl p-5 focus:outline-none prose prose-lg max-w-none",},
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // IMAGE URL
  const addImage = () => {
    const url = window.prompt("Enter image URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // YOUTUBE
  const addYoutube = () => {
    const url = window.prompt("Enter YouTube URL");

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 360,
      });
    }
  };

  return (
    <div className="space-y-4">

      {/* TOOLBAR */}
      <div className="
        flex
        flex-wrap
        gap-2
        border
        border-gray-200
        rounded-2xl
        p-3
        bg-white
      ">

        {/* Bold */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Bold
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Italic
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleUnderline().run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Underline
        </button>

        {/* H1 */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          H1
        </button>

        {/* H2 */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          H2
        </button>

        {/* Bullet List */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Bullet
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Ordered
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Quote
        </button>

        {/* Highlight */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHighlight().run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Highlight
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setHorizontalRule().run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Line
        </button>

        {/* LEFT */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Left
        </button>

        {/* CENTER */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Center
        </button>

        {/* RIGHT */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Right
        </button>

        {/* TEXT COLOR */}
        <input
          type="color"
          onInput={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          className="w-10 h-10"
        />

        {/* TABLE */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().insertTable({
              rows: 3,
              cols: 3,
              withHeaderRow: true,
            }).run()
          }
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Table
        </button>

        {/* IMAGE */}
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1 border rounded-lg text-sm"
        >
          Image
        </button>

        {/* YOUTUBE */}
        <button
          type="button"
          onClick={addYoutube}
          className="px-3 py-1 border rounded-lg text-sm"
        >
          YouTube
        </button>

      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} />

    </div>
  );
}