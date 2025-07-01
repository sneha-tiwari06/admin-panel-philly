import React, { useRef } from "react";
import JoditEditor from "jodit-react";

export default function TextEditor({ value, onChange }) {
  const editor = useRef(null);

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={{
        readonly: false,
        toolbarSticky: false,
        height: 400,
        buttons: [
          "source", "bold", "italic", "underline", "strikethrough", "ul", "ol", "outdent", "indent",
          "font", "fontsize", "brush", "paragraph", "formatBlock", "image", "table", "link", "align",
          "undo", "redo", "hr", "copyformat", "fullsize"
        ],
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
      onBlur={newContent => onChange(newContent)}
      onChange={() => {}} // required for controlled mode, but you can leave it empty
    />
  );
}
