import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import Button from "@/components/Button";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [products, setProducts] = useState<
    { id: string; name: string; createdAt: String }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetch(`/api/get-products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items));
  });

  const onHandleClick = () => {
    if (inputRef.current == null || inputRef.current.value === "") {
      alert("name을 넣어주세요.");
      return;
    }
    fetch(`/api/add-item?name=${inputRef.current.value}`)
      .then((res) => res.json())
      .then((data) => alert(data.message));
  };
  return (
    <div>
      <input
        type="text"
        ref={inputRef}
        className="placeholder:italic placeholder:text-slate-400 block bg-white w-96 border border-slate-300 rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
        placeholder="Search for anything..."
        name="search"
      />
      <button
        css={css`
          background-color: hotpink;
          padding: 16px;
          border-radius: 8px;
        `}
        onClick={onHandleClick}
      >
        Add Jacket
      </button>
      <Button onClick={onHandleClick}>Add Jacket 2</Button>
      <div>
        <p>Product List</p>
        {products &&
          products.map((item) => (
            <div key={item.id}>
              {item.name} <span>{item.createdAt}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
