import { CountControl } from "@/components/CountControl";
import { CART_QUERY_KEY, CATEGORY_MAP } from "@/constants/products";
import styled from "@emotion/styled";
import { Button } from "@mantine/core";
import { Cart, products } from "@prisma/client";
import { IconRefresh, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
interface CartItem extends Cart {
  name: string;
  image_url: string;
  price: number;
}
// interface CartItem {
//   name: string;
//   productId: number;
//   amount: number;
//   price: number;
//   image_url: string;
//   cost: number;
// }


function CartPage() {
  const { data } = useQuery<{ items: CartItem[] }, unknown, CartItem[]>(
    [CART_QUERY_KEY],
    () =>
      fetch(CART_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.items)
  );
  const deliPay = data && data.length > 0 ? 3000 : 0;
  const discount = 0;
  const totalCost = useMemo(() => {
    if (data == null) {
      return 0;
    }
    return data
      .map((item) => item.totalprice)
      .reduce((prev, curr) => prev + curr, 0);
  }, [data]);
  const router = useRouter();

  const { data: products } = useQuery<
    { items: products[] },
    unknown,
    products[]
  >(
    [`/api/get-products?skip=0&take=3`],
    () => fetch(`/api/get-products?skip=0&take=3`).then((res) => res.json()),
    {
      select: (data) => data.items,
    }
  );
  const onHandleOrder = () => {
    // 장바구니 주문 기능 구현
    alert("주문되었습니다.");
  };
  return (
    <div>
      <span className="text-2xl mb-3">Cart ({data ? data.length : 0})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data ? (
            data.length > 0 ? (
              data.map((item, idx) => <Item key={idx} {...item} />)
            ) : (
              <div>장바구니에 아무것도 없습니다.</div>
            )
          ) : (
            <div>불러오는 중...</div>
          )}
        </div>
        <div className="px-4">
          <div
            className="flex flex-col p-4 space-y-4"
            style={{ minWidth: 300, border: "1px solid grey" }}
          >
            <div>Info</div>
            <Row>
              <span>금액</span>
              <span>{totalCost.toLocaleString("ko-kr")} 원</span>
            </Row>
            <Row>
              <span>배송비</span>
              <span>{deliPay.toLocaleString("ko-kr")} 원</span>
            </Row>
            <Row>
              <span>할인 금액</span>
              <span>{discount.toLocaleString("ko-kr")} 원</span>
            </Row>
            <Row>
              <span className="font-semibold">결제 금액</span>
              <span className="font-semibold text-red-500">
                {(totalCost + deliPay - discount).toLocaleString("ko-kr")} 원
              </span>
            </Row>
            <Button
              style={{ backgroundColor: "black" }}
              radius="xl"
              size="md"
              styles={{
                root: { height: 48 },
              }}
              onClick={onHandleOrder}
            >
              구매하기
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-32">
        <p>추천상품</p>
        {products && (
          <div className="grid grid-cols-3 gap-5">
            {products.map((item) => (
              <div
                key={item.id}
                style={{ maxWidth: 310 }}
                onClick={() => router.push(`/products/${item.id}`)}
              >
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
      </div>
    </div>
  );
}

export default CartPage;

const Item = (props: CartItem) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity);
  const [cost, setCost] = useState<number>(props.quantity);
  useEffect(() => {
    if (quantity != null) {
      setCost(quantity * props.price);
    }
  }, [quantity, props.price]);
  const { mutate: updateMutate } = useMutation<unknown, unknown, Cart, any>(
    (item) =>
      fetch(`/api/update-cart`, {
        method: "POST",
        body: JSON.stringify({ item }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: async (item) => {
        await queryClient.cancelQueries([CART_QUERY_KEY]);
        // 현재 값 가져오기
        const previous = queryClient.getQueryData([CART_QUERY_KEY]);
        // 그 가져온 현재의 값을 리턴하고, 있었다면 빼버리고, 없었다면 추가한 상태로 리턴
        queryClient.setQueryData<Cart[]>([CART_QUERY_KEY], (old) =>
          old?.filter((c) => c.id !== item.id).concat(item)
        );
        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueryData([CART_QUERY_KEY], context.previous);
      },
      onSuccess: () => {
        queryClient.invalidateQueries([CART_QUERY_KEY]);
      },
    }
  );
  const { mutate: deleteMutate } = useMutation<unknown, unknown, number, any>(
    (id) =>
      fetch(`/api/delete-cart`, {
        method: "POST",
        body: JSON.stringify({ id }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries([CART_QUERY_KEY]);
        // 현재 값 가져오기
        const previous = queryClient.getQueryData([CART_QUERY_KEY]);
        // 그 가져온 현재의 값을 리턴하고, 있었다면 빼버리고, 없었다면 추가한 상태로 리턴
        queryClient.setQueryData<Cart[]>([CART_QUERY_KEY], (old) =>
          old?.filter((c) => c.id !== id)
        );
        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueryData([CART_QUERY_KEY], context.previous);
      },
      onSuccess: () => {
        queryClient.invalidateQueries([CART_QUERY_KEY]);
      },
    }
  );
  const onHandleDelete = async () => {
    // todo - 장바구니 삭제 기능 구현
    await deleteMutate(props.id);
    alert("삭제되었습니다.");
  };
  const onHandleUpdate = () => {
    // todo - 장바구니 업데이트 기능 구현
    if (quantity == null) {
      alert("최소 수량을 선택하세요");
      return;
    }
    updateMutate({
      ...props,
      quantity: quantity,
      totalprice: props.price * quantity,
    });
  };

  return (
    <div className="w-full flex p-4" style={{ borderBottom: "1px solid grey" }}>
      <Image
        src={props.image_url}
        width={155}
        height={195}
        alt={props.name}
        onClick={() => router.push(`/products/${props.productId}`)}
      />
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">
          가격: {props.totalprice.toLocaleString("ko-kr")}원
        </span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} max={100} />
          <IconRefresh onClick={onHandleUpdate} />
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{cost.toLocaleString("ko-kr")} 원</span>
        <IconX onClick={onHandleDelete} />
      </div>
    </div>
  );
};

const Row = styled.div`
  display: flex;
  * ~ * {
    margin-left: auto;
  }
`;
