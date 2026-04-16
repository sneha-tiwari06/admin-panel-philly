import React, { useRef } from "react";
import JoditEditor from "jodit-react";

export default function TextEditor({ value, onChange, height = 400 }) {
  const editor = useRef(null);
  const cleanEditorHtml = (html = "") => {
    if (typeof html !== "string" || !html) return "";
    const normalized = html.trim();
    if (
      /^<p><br><\/p>$/i.test(normalized) ||
      /^<p>(&nbsp;|\s|<br>)*<\/p>$/i.test(normalized) ||
      /^<div>(&nbsp;|\s|<br>)*<\/div>$/i.test(normalized)
    ) {
      return "";
    }

    const container = document.createElement("div");
    container.innerHTML = normalized;

    const textOnly = (container.textContent || "").replace(/\u00A0/g, " ").trim();
    if (!textOnly) return "";

    return normalized;
  };
  const normalizedValue = value || "";
  const getEditorInstance = (instanceArg) =>
    instanceArg || editor.current?.editor || editor.current;
  const sanitizeInstanceValue = (instanceArg) => {
    const instance = getEditorInstance(instanceArg);
    if (!instance || typeof instance.value !== "string") return;
    const cleaned = cleanEditorHtml(instance.value);
    if (!cleaned && instance.value) instance.value = "";
  };

  return (
    <JoditEditor
      ref={editor}
      value={normalizedValue}
      config={{
        readonly: false,
        toolbarSticky: false,
        height: height,
        enter: "BR",
        defaultMode: 1,
        useSearch: false,
        beautifyHTML: false,
        nl2brInPlainText: false,
        cleanHTML: {
          fillEmptyParagraph: false,
          removeEmptyElements: true,
        },
        buttons: [
          "source", "bold", "italic", "underline", "strikethrough", "ul", "ol", "outdent", "indent",
          "font", "fontsize", "brush", "paragraph", "formatBlock", "image", "table", "link", "align",
          "undo", "redo", "hr", "copyformat", "fullsize"
        ],
        events: {
          afterInit: (instance) => sanitizeInstanceValue(instance),
          afterSetMode: (instance) => sanitizeInstanceValue(instance),
          blur: (instance) => sanitizeInstanceValue(instance),
        },
        uploader: { insertImageAsBase64URI: true },
        style: {
          "p": "Paragraph",
          "h1": "Heading 1",
          "h2": "Heading 2",
          "h3": "Heading 3",
          "h4": "Heading 4",
          "h5": "Heading 5",
          "h6": "Heading 6",
          "blockquote": "Quote",
          "pre": "Code"
        },
        controls: {
          paragraph: {
            list: {
              p: "Paragraph",
              h1: "Heading 1",
              h2: "Heading 2",
              h3: "Heading 3",
              h4: "Heading 4",
              h5: "Heading 5",
              h6: "Heading 6",
              blockquote: "Quote",
              pre: "Code"
            }
          }
        }
      }}
      tabIndex={1}
      onBlur={(newContent) => onChange(cleanEditorHtml(newContent))}
      onChange={() => {}} // keep editor uncontrolled while typing to prevent focus jump
    />
  );
}
