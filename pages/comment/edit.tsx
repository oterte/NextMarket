import CutsomEditor from "@/components/Editor";
import { Slider } from "@mantine/core";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

// db에 저장해둔 후기의 내용 가져오기
function CommentEdit() {
  const router = useRouter();
  const { orderItemId } = router.query;
  const [rate, setRate] = useState(5);
  const [editorState, setEditorState] = useState<EditorState | undefined>(
    undefined
  );

  useEffect(() => {
    if (orderItemId != null) {
      fetch(`/api/get-comment?orderItemId=${orderItemId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.items.contents) {
            setEditorState(
              EditorState.createWithContent(
                convertFromRaw(JSON.parse(data.items.contents))
              )
            );
            setRate(data.items.rate);
          } else {
            setEditorState(EditorState.createEmpty());
          }
        });
    }
  }, [orderItemId]);

  const handleSave = () => {
    if (editorState && orderItemId != null) {
      fetch("/api/update-comment", {
        method: "POST",
        body: JSON.stringify({
          orderItemId: orderItemId,
          rate: rate,
          contents: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          images: [],
        }),
      })
        .then((res) => res.json())
        .then(() => {
          alert("Success");
        });
    }
  };
  return (
    <div>
      {editorState != null && (
        <CutsomEditor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          onSave={handleSave}
        />
      )}
      <Slider
        defaultValue={5}
        min={1}
        max={5}
        step={1}
        value={rate}
        onChange={setRate}
        marks={[
          { value: 1 },
          { value: 2 },
          { value: 3 },
          { value: 4 },
          { value: 5 },
        ]}
      />
    </div>
  );
}

export default CommentEdit;
