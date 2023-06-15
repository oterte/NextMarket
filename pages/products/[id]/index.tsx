import { CountControl } from "@/components/CountControl";
import CutsomEditor from "@/components/Editor";
import {
  CART_QUERY_KEY,
  CATEGORY_MAP,
  ORDER_QUERY_KEY,
} from "@/constants/products";
import { Button } from "@mantine/core";
import { Cart, OrderItem, products } from "@prisma/client";
import {
  IconHeart,
  IconHeartbeat,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { convertFromRaw, EditorState } from "draft-js";
import { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import Carousel from "nuka-carousel";
import { useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const product = await fetch(
    `http://localhost:3000/api/get-product?id=${context.params?.id}`
  )
    .then((res) => res.json())
    .then((data) => data.items);
  return {
    props: {
      product: { ...product, images: [product.image_url, product.image_url] },
    },
  };
}

export default function Products(props: {
  product: products & { images: string[] };
}) {
  const [index, setIndex] = useState(0);
  const { data: session } = useSession();
  const [many, setMany] = useState<number | undefined>(1);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: productId }: any = router.query;
  const [editorState] = useState<EditorState | undefined>(() =>
    props.product.contents
      ? EditorState.createWithContent(
          convertFromRaw(JSON.parse(props.product.contents))
        )
      : EditorState.createEmpty()
  );

  const { data: wishlist } = useQuery(["/api/get-wishlist"], () =>
    fetch("/api/get-wishlist")
      .then((res) => res.json())
      .then((data) => data.items)
  );

  const { mutate, isLoading } = useMutation<unknown, unknown, string, any>(
    (productId) =>
      fetch(`/api/update-wishlist`, {
        method: "POST",
        body: JSON.stringify({ productId }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: async (productId) => {
        // 위시리스트 조회하고 있다면 멈추고
        await queryClient.cancelQueries(["/api/get-wishlist"]);
        // 현재 값 가져오기
        const previous = queryClient.getQueryData(["/api/get-wishlist"]);
        // 그 가져온 현자의 값을 리턴하고, 있었다면 빼버리고, 없었다면 추가한 상태로 리턴
        queryClient.setQueryData<string[]>(["wishlist"], (old) =>
          old
            ? old.includes(String(productId))
              ? old.filter((id) => id != String(productId))
              : old.concat(String(productId))
            : []
        );
        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueryData(["/api/get-wishlist"], context.previous);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["/api/get-wishlist"]);
      },
    }
  );

  const { mutate: addCart } = useMutation<
    unknown,
    unknown,
    Omit<Cart, "id" | "userId">,
    any
  >(
    (item) =>
      fetch(`/api/add-cart`, {
        method: "POST",
        body: JSON.stringify({ item }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: () => {
        queryClient.invalidateQueries([CART_QUERY_KEY]);
      },
      onSuccess: () => {
        router.push("/cart");
      },
    }
  );
  const { mutate: addOrder } = useMutation<
    unknown,
    unknown,
    Omit<OrderItem, "id">[],
    any
  >(
    (items) =>
      fetch(`/api/add-order`, {
        method: "POST",
        body: JSON.stringify({ items }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: () => {
        queryClient.invalidateQueries([ORDER_QUERY_KEY]);
      },
      onSuccess: () => {
        router.push("/my");
      },
    }
  );
  const product = props.product;
  const validate = (type: "cart" | "order") => {
    if (many == null) {
      alert("최소 수량을 선택하세요");
      return;
    }
    if (type === "cart") {
      addCart({
        productId: product.id,
        quantity: many,
        totalprice: product.price * many,
      });
    }
    if (type === "order") {
      addOrder([
        {
          productId: product.id,
          quantity: many,
          eachPrice: product.price,
          totalprice: product.price * many,
        },
      ]);
    }
  };

  // console.log(wishlist);
  const isWished =
    wishlist != null && productId != null
      ? wishlist.includes(productId)
      : false;
  return (
    <>
      {product != null && productId != null ? (
        <div className="p-24 flex felx-row">
          <div style={{ maxWidth: 600, marginRight: 52 }}>
            <Carousel
              animation="fade"
              withoutControls
              wrapAround
              speed={10}
              slideIndex={index}
            >
              {product.images.map((item, idx) => (
                <Image
                  key={`url-carousel-${idx}`}
                  src={item}
                  alt="image"
                  width={620}
                  height={780}
                  layout="responsive"
                />
              ))}
            </Carousel>
            <div className="flex space-x-4 mt-2">
              {product.images.map((item, idx) => (
                <div key={`url-thumb-${idx}`} onClick={() => setIndex(idx)}>
                  <Image src={item} alt="image" width={155} height={195} />
                </div>
              ))}
            </div>
            {editorState != null && (
              <CutsomEditor editorState={editorState} readOnly />
            )}
          </div>
          <div style={{ maxWidth: 600 }} className="flex flex-col space-y-6">
            <div className="text-lg text-zinc-400">
              {CATEGORY_MAP[product.category_id - 1]}
            </div>
            <div className="text-4xl font-semibold">{product.name}</div>
            <div className="text-lg">
              {product.price.toLocaleString("ko-kr")}원
            </div>
            <div>
              <span className="text-lg">수량</span>
              <CountControl
                value={many}
                setValue={setMany}
                min={1}
                max={100}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                leftIcon={<IconShoppingCart size={20} stroke={1.5} />}
                style={{ backgroundColor: "black" }}
                radius="xl"
                size="md"
                styles={{
                  root: { paddingRight: 14, height: 48 },
                }}
                onClick={() => {
                  if (session == null) {
                    alert("로그인이 필요합니다.");
                    router.push("/auth/login");
                    return;
                  }
                  validate("cart");
                }}
              >
                장바구니
              </Button>
              <Button
                // loading={isLoading}
                disabled={wishlist == null}
                leftIcon={
                  isWished ? (
                    <IconHeart size={20} stroke={1.5} />
                  ) : (
                    <IconHeartbeat size={20} stroke={1.5} />
                  )
                }
                style={{ backgroundColor: isWished ? "red" : "grey" }}
                radius="xl"
                size="md"
                styles={{
                  root: { paddingRight: 14, height: 48 },
                }}
                onClick={() => {
                  if (session == null) {
                    alert("로그인이 필요합니다.");
                    router.push("/auth/login");
                    return;
                  }
                  mutate(productId);
                }}
              >
                찜하기
              </Button>
            </div>
            <Button
              style={{ backgroundColor: "black" }}
              radius="xl"
              size="md"
              styles={{
                root: { paddingRight: 14, height: 48 },
              }}
              onClick={() => {
                if (session == null) {
                  alert("로그인이 필요합니다.");
                  router.push("/auth/login");
                  return;
                }
                validate("order");
              }}
            >
              구매하기
            </Button>
            <div className="text-sm text-zinc-300">
              등록: {format(new Date(product.createdAt), "yyyy년 M월 d일")}
            </div>
          </div>
        </div>
      ) : (
        <div>로딩중</div>
      )}
    </>
  );
}
