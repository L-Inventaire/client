import Delta from "quill-delta";
import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./index.css";
import { twMerge } from "tailwind-merge";
import { InputOutlinedDefaultBorders } from "@atoms/styles/inputs";

type EditorInputProps = {
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: string) => void;
};

const delta = new Delta() as unknown as any;

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
  ],
};

export const EditorInput = (props: EditorInputProps) => {
  const ref = useRef<ReactQuill>(null);
  const [focused, setFocused] = useState(false);

  const onEditorChange = (value: any) => {
    props.onChange?.(value);
  };

  return (
    <ReactQuill
      ref={ref}
      onKeyDown={(e) => {
        // If escape key is pressed, blur the editor
        if (e.key === "Escape") {
          ref.current?.blur();
          setFocused(false);
        }
        // If contains ctrl key, don't stop propagation
        if (e.ctrlKey || e.metaKey) {
          return;
        }
        e.stopPropagation();
      }}
      onKeyUp={(e) => {
        e.stopPropagation();
      }}
      onKeyPress={(e) => {
        e.stopPropagation();
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder="Cliquer pour ajouter une note"
      className={twMerge(
        "editor-input p-2",
        InputOutlinedDefaultBorders,
        focused && "has-focus"
      )}
      theme="snow"
      value={props.value || ""}
      onChange={onEditorChange}
      modules={modules}
    />
  );
};
