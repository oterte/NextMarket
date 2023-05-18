import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { json } from "stream/consumers";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [products, setProducts] = useState<{ id: string; name: string; createdAt:String }[]>([]);
  useEffect(() => {
    fetch(`/api/get-products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items));
  });

  const onHandleClick = () => {
    fetch('/api/add-item?name="Jacket"')
      .then((res) => res.json())
      .then((data) => alert(data.message));
  };
  return (
    <div>
      <button onClick={onHandleClick}>Add Jacket</button>
      <div>
        <p>Product List</p>
        {products &&
          products.map((item) => <div key={item.id}>{item.name} <span>{item.createdAt}</span></div>)}
      </div>
    </div>
  );
}
