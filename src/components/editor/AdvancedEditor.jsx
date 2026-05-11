"use client";

import { Editor } from "@tinymce/tinymce-react";

export default function AdvancedEditor({
  value,
  onChange,
}) {

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-300">

<Editor
  tinymceScriptSrc="/tinymce/tinymce.min.js"

  value={value}

  onEditorChange={(content) => onChange(content)}

  init={{
    license_key: "gpl",
    height: 600,

    menubar: true,

    branding: false,

    promotion: false,

    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "help",
      "wordcount",
    ],

    toolbar:
      "undo redo | " +
      "blocks | " +
      "bold italic underline forecolor backcolor | " +
      "alignleft aligncenter alignright alignjustify | " +
      "bullist numlist outdent indent | " +
      "table image media link | " +
      "removeformat code fullscreen",

    automatic_uploads: true,

    images_upload_handler: async (blobInfo) => {

      const formData = new FormData();

      formData.append(
        "image",
        blobInfo.blob(),
        blobInfo.filename()
      );

      try {

        const res = await fetch(
          "http://localhost:5000/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();

        return data.url;

      } catch (err) {

        console.error(err);

        throw new Error("Image upload failed");
      }
    },

    content_style: `
      body {
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.8;
        padding: 20px;
      }

      img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      table td,
      table th {
        border: 1px solid #ccc;
        padding: 10px;
      }
    `,
  }}
/>

    </div>
  );
}