import { CountControl } from "@/components/CountControl";
import styled from "@emotion/styled";
import { IconRefresh, IconX } from "@tabler/icons-react";
import Image from "next/image";
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

  useEffect(() => {
    const mockData = [
      {
        name: "멋들어진 신발",
        productId: 100,
        amount: 1,
        price: 20000,
        cost: 20000,
        image_url:
          "https://cdn.shopify.com/s/files/1/0282/5850/products/footwear_nike_air-force-1-low-retro_DJ3911-100.view_1_720x.jpg",
      },
      {
        name: "멋들어진 모자",
        productId: 101,
        amount: 3,
        price: 25000,
        cost: 75000,
        image_url:
          "https://cdn.shopify.com/s/files/1/0282/5850/products/accessories_headwear_undefeated_wave-strapback_90218.color_teal.view_1_720x.jpg",
      },
    ];
    setCart(mockData);
  }, []);
  return (
    <div>
      <span className="text-2xl mb-3">Cart ({cart.length})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {cart.map((item, idx) => (
            <Item key={idx} {...item} />
          ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

const Item = (props: CartItem) => {
  const [quantity, setQuantity] = useState<number | undefined>(props.amount);
  const [cost, setCost] = useState<number>(props.amount);
  useEffect(() => {
    if (quantity != null) {
      setCost(quantity * props.price);
    }
  }, [quantity, props.price]);
  return (
    <div className="w-full flex p-4" style={{ borderBottom: "1px solid grey" }}>
      <Image src={props.image_url} width={155} height={195} alt={props.name} />
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">
          가격: {props.price.toLocaleString("ko-kr")}원
        </span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} max={100} />
          <IconRefresh />
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{cost.toLocaleString("ko-kr")} 원</span>
        <IconX />
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
