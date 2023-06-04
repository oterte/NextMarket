import CutsomEditor from "@/components/Editor";
import { CATEGORY_MAP } from "@/constants/products";
import { Button } from "@mantine/core";
import { products } from "@prisma/client";
import { IconHeart, IconHeartbeat } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
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

  // console.log(wishlist);
  const product = props.product;
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
                  width={600}
                  height={600}
                  layout="responsive"
                />
              ))}
            </Carousel>
            <div className="flex space-x-4 mt-2">
              {product.images.map((item, idx) => (
                <div key={`url-thumb-${idx}`} onClick={() => setIndex(idx)}>
                  <Image src={item} alt="image" width={100} height={190} />
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
