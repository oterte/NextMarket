import { Take } from "@/constants/products";
import { products } from "@prisma/client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";



function Products() {
  const [skip, setSkip] = useState(0);
  const [products, setProducts] = useState<products[]>([]);

  useEffect(() => {
    fetch(`/api/get-products?skip=0&take=${Take}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items));
  }, []);

  const onGetProducts = useCallback(() => {
    const next = skip + Take;
    fetch(`/api/get-products?skip=${next}&take=${Take}`)
      .then((res) => res.json())
      .then((data) => {
        // 배열 불변성 유지 필수
        const list = products.concat(data.items)
        setProducts(list)
      });
      setSkip(next)
  }, [skip, products]);
  return (
    <div className="px-36 mt-36 mb-36">
      {products && (
        <div className="grid grid-cols-3 gap-5">
          {products.map((item) => (
            <div key={item.id}>
              <Image
                className="rounded"
                src={item.image_url ?? ""}
                alt={item.name}
                width={300}
                height={200}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
              />
              <div className="flex">
                <span>{item.name}</span>
                <span className="ml-auto">
                  {item.price.toLocaleString("ko-kr")} 원
                </span>
              </div>
              <span className="text-zinc-400">
                {item.category_id === 1 && "의류"}
              </span>
            </div>
          ))}
        </div>
      )}
      <button
        className="w-full rounded mt-20 bg-zinc-200 p-4"
        onClick={onGetProducts}
      >
        더보기
      </button>
    </div>
  );
}

export default Products;
