import React, { Dispatch, SetStateAction } from "react";
import dynamic from "next/dynamic";
import { EditorState } from "draft-js";
import { EditorProps } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import styled from "@emotion/styled";
import Button from "./Button";

const Editor = dynamic<EditorProps>(
  () => import("react-draft-wysiwyg").then((module) => module.Editor),
  {
    ssr: false,
  }
);

function CutsomEditor({
  editorState,
  readOnly = false,
  onSave,
  onEditorStateChange,
}: {
  editorState: EditorState;
  readOnly?: boolean;
  onSave?: () => void;
  onEditorStateChange?: Dispatch<SetStateAction<EditorState | undefined>>;
}) {
  return (
    <Wrapper readOnly={readOnly}>
      <Editor
        readOnly={readOnly}
        editorState={editorState}
        toolbarHidden={readOnly}
        toolbarClassName="editorToolbar-hidden"
        wrapperClassName="wrapper-class"
        editorClassName="editor-class"
        toolbar={{
          options: ["inline", "list", "textAlign", "link"],
        }}
        localization={{
          locale: "ko",
        }}
        onEditorStateChange={onEditorStateChange}
      />
      {!readOnly && <Button onClick={onSave}>Save</Button>}
    </Wrapper>
  );
}

export default CutsomEditor;

const Wrapper = styled.div<{ readOnly: boolean }>`
  padding: 16px;
  ${(props) =>
    props.readOnly ? "" : "border: 1px solid black; border-radius:8px;"}
`;
