import { categories, products } from "@prisma/client";
import Image from "next/image";
import {  useState } from "react";
import { Input, Pagination, SegmentedControl, Select } from "@mantine/core";
import { CATEGORY_MAP, FILTERS, Take } from "@/constants/products";
import { IconSearch } from "@tabler/icons-react";
import useDebounce from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { chownSync } from "fs";

function Home() {
  const router = useRouter()
  const [activePage, setPage] = useState(1);
  // const [total, setTotal] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<string>("-1");
  const [filter, setFilter] = useState<string | null>(FILTERS[0].value);
  const [keyword, setKeyword] = useState("");

  const debouncedSearch = useDebounce<string>(keyword);

  const { data: categories } = useQuery<
    { items: categories[] },
    unknown,
    categories[]
  >(
    ["/api/get-categories"],
    () => fetch(`/api/get-categories`).then((res) => res.json()),
    { select: (data) => data.items }
  );
  const { data: total } = useQuery(
    [
      `/api/get-products-count?category=${selectedCategory}&contains=${debouncedSearch}`,
    ],
    () =>
      fetch(
        `/api/get-products-count?category=${selectedCategory}&contains=${debouncedSearch}`
      )
        .then((res) => res.json())
        .then((data) => Math.ceil(data.items / Take))
  );
  const { data: products } = useQuery<
    { items: products[] },
    unknown,
    products[]
  >(
    [
      `/api/get-products?skip=${
        Take * (activePage - 1)
      }&take=${Take}&category=${selectedCategory}&orderBy=${filter}&contains=${debouncedSearch}`,
    ],
    () =>
      fetch(
        `/api/get-products?skip=${
          Take * (activePage - 1)
        }&take=${Take}&category=${selectedCategory}&orderBy=${filter}&contains=${debouncedSearch}`
      ).then((res) => res.json()),
    {
      select: (data) => data.items,
    }
  );

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };
  return (
    <div className="px-36 mt-36 mb-36">
      <div className="mb-4">
        <Input
          icon={<IconSearch />}
          placeholder="Search"
          value={keyword}
          onChange={onHandleChange}
        />
      </div>
      <div className="mb-4">
        <Select value={filter} onChange={setFilter} data={FILTERS} />
      </div>
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
            <div key={item.id} style={{ maxWidth: 310 }} onClick={() => router.push(`/products/${item.id}`)}>
              <Image
                className="rounded"
                src={item.image_url ?? ""}
                alt={item.name}
                width={310}
                height={390}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0tbSsBwACegEoriWGfgAAAABJRU5ErkJggg=="
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
      <div className="w-full flex mt-5">
        {total && (
          <Pagination
            className="m-auto"
            value={activePage}
            onChange={setPage}
            total={total}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
