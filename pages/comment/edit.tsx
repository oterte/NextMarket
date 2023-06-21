import AutoSizeImage from "@/components/AutoSizeImage";
import Button from "@/components/Button";
import CutsomEditor from "@/components/Editor";
import { Slider } from "@mantine/core";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";

// db에 저장해둔 후기의 내용 가져오기
function CommentEdit() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
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
            setImages(data.items.images.split(",") ?? []);
          } else {
            setEditorState(EditorState.createEmpty());
          }
        });
    }
  }, [orderItemId]);

  const onHandleSave = () => {
    if (editorState && orderItemId != null) {
      fetch("/api/update-comment", {
        method: "POST",
        body: JSON.stringify({
          orderItemId: Number(orderItemId),
          rate: rate,
          contents: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
          images: images.join(","),
        }),
      })
        .then((res) => res.json())
        .then(() => {
          alert("Success");
          router.back();
        });
    }
  };
  const onHandleChange = () => {
    if (
      inputRef.current &&
      inputRef.current.files &&
      inputRef.current.files.length > 0
    ) {
      for (let i = 0; i < inputRef.current.files.length; i++) {
        const fd = new FormData();
        fd.append(
          "image",
          inputRef.current.files[i],
          inputRef.current.files[i].name
        );
        fetch(
          "https://api.imgbb.com/1/upload?key=0d1407d4fe62bbc404a5864d9ced111b&expiration=15552000",
          {
            method: "POST",
            body: fd,
          }
        )
          .then((res) => res.json())
          .then((data) => {
            console.log("edit data.......", data);
            // 반복을 허용하지 않는 Set 객체
            // 그 안에서 자체로 유일한 값들로만 이루어지게
            setImages((prev) =>
              Array.from(new Set(prev.concat(data.data.image.url)))
            );
          })
          .catch((error) => console.log(error));
      }
    }
  };
  return (
    <div>
      {editorState != null && (
        <CutsomEditor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          onSave={onHandleSave}
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onHandleChange}
      />
      <div style={{ display: "flex" }}>
        {images &&
          images.length > 0 &&
          images.map((image, idx) => <AutoSizeImage key={idx} src={image} />)}
      </div>
    </div>
  );
}

export default CommentEdit;
