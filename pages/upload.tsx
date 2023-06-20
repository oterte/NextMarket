import AutoSizeImage from "@/components/AutoSizeImage";
import Button from "@/components/Button";
import Image from "next/image";
import React, { useRef, useState } from "react";

function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState("");
  const onHandleUpload = () => {
    if (inputRef.current && inputRef.current.files) {
      const fd = new FormData();
      fd.append(
        "image",
        inputRef.current.files[0],
        inputRef.current.files[0].name
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
          console.log(data);
          setImage(data.data.image.url);
        })
        .catch((error) => console.log(error));
    }
  };
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" />
      <Button onClick={onHandleUpload}>업로드</Button>
      {image !== "" && <AutoSizeImage src={image} />}
    </div>
  );
}

export default ImageUpload;
