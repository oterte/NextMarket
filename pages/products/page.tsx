import { categories, products } from "@prisma/client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Pagination, SegmentedControl } from "@mantine/core";
import { CATEGORY_MAP, Take } from "@/constants/products";

function Products() {
  // const [skip, setSkip] = useState(0);
  const [activePage, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<categories[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("-1");
  const [products, setProducts] = useState<products[]>([]);

  useEffect(() => {
    fetch(`/api/get-categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.items));
  },[])
  useEffect(() => {
    fetch(`/api/get-products-count?category=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => setTotal(Math.ceil(data.items / Take)));
  }, [selectedCategory])

  useEffect(() => {
    const skip = Take * (activePage - 1);
    fetch(
      `/api/get-products?skip=${skip}&take=${Take}&category=${selectedCategory}`
    )
      .then((res) => res.json())
      .then((data) => setProducts(data.items));
  }, [activePage, selectedCategory]);

  // const onGetProducts = useCallback(() => {
  //   const next = skip + Take;
  //   fetch(`/api/get-products?skip=${next}&take=${Take}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       // 배열 불변성 유지 필수
  //       const list = products.concat(data.items)
  //       setProducts(list)
  //     });
  //     setSkip(next)
  // }, [skip, products]);
  return (
    <div className="px-36 mt-36 mb-36">
      {categories && (
        <div className="mb-4">
          <SegmentedControl
            value={selectedCategory}
            onChange={setSelectedCategory}
            data={[
              { label: "All", value: "-1" },
              ...categories.map((item) => ({
                label: item.name,
                value: String(item.id),
              })),
            ]}
            color="dark"
          />
        </div>
      )}
      {products && (
        <div className="grid grid-cols-3 gap-5">
          {products.map((item) => (
            <div key={item.id} style={{ maxWidth: 310 }}>
              <Image
                className="rounded"
                src={item.image_url ?? ""}
                alt={item.name}
                width={310}
                height={390}
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
                {CATEGORY_MAP[item.category_id - 1]}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* <button
        className="w-full rounded mt-20 bg-zinc-200 p-4"
        onClick={onGetProducts}
      >
        더보기
      </button> */}
      <div className="w-full flex mt-5">
        <Pagination
          className="m-auto"
          value={activePage}
          onChange={setPage}
          total={total}
        />
      </div>
    </div>
  );
}

export default Products;
