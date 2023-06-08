import { CountControl } from "@/components/CountControl";
import { CATEGORY_MAP } from "@/constants/products";
import styled from "@emotion/styled";
import { Button } from "@mantine/core";
import { products } from "@prisma/client";
import { IconRefresh, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
interface CartItem {
  name: string;
  productId: number;
  amount: number;
  price: number;
  image_url: string;
  cost: number;
}

function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const deliPay = 3000;
  const discount = 0;
  const totalCost = useMemo(() => {
    return cart.map((item) => item.cost).reduce((prev, curr) => prev + curr, 0);
  }, [cart]);
  const router = useRouter();
  useEffect(() => {
    const mockData = [
      {
        name: "멋들어진 신발",
        productId: 56,
        amount: 1,
        price: 20000,
        cost: 20000,
        image_url:
          "https://cdn.shopify.com/s/files/1/0282/5850/products/footwear_nike_air-force-1-low-retro_DJ3911-100.view_1_720x.jpg",
      },
      {
        name: "멋들어진 모자",
        productId: 89,
        amount: 3,
        price: 25000,
        cost: 75000,
        image_url:
          "https://cdn.shopify.com/s/files/1/0282/5850/products/accessories_headwear_undefeated_wave-strapback_90218.color_teal.view_1_720x.jpg",
      },
    ];
    setCart(mockData);
  }, []);
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
      <span className="text-2xl mb-3">Cart ({cart.length})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {cart.length > 0 ? (
            cart.map((item, idx) => <Item key={idx} {...item} />)
          ) : (
            <div>장바구니에 아무것도 없습니다.</div>
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

export default Cart;

const Item = (props: CartItem) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number | undefined>(props.amount);
  const [cost, setCost] = useState<number>(props.amount);
  useEffect(() => {
    if (quantity != null) {
      setCost(quantity * props.price);
    }
  }, [quantity, props.price]);
  const onHandleDelete = () => {
    // todo - 장바구니 삭제 기능 구현
    alert("삭제되었습니다.");
  };
  const onHandleUpdate = () => {
    // todo - 장바구니 업데이트 기능 구현
    alert("삭제되었습니다.");
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
          가격: {props.price.toLocaleString("ko-kr")}원
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
