import { CountControl } from "@/components/CountControl";
import { ORDER_QUERY_KEY, ORDER_STATUS_MAP } from "@/constants/products";
import styled from "@emotion/styled";
import { OrderItem, Orders } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface OrderItemDetail extends OrderItem {
  name: string;
  image_url: string;
}

interface OrderDetail extends Orders {
  orderItems: OrderItemDetail[];
}

function MyPage() {
  const { data } = useQuery<{ items: OrderDetail[] }, unknown, OrderDetail[]>(
    [ORDER_QUERY_KEY],
    () =>
      fetch(ORDER_QUERY_KEY)
        .then((res) => res.json())
        .then((data) => data.items)
  );

  const router = useRouter();

  return (
    <div>
      <span className="text-2xl mb-3">
        주문 내역 ({data ? data.length : 0})
      </span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data ? (
            data.length > 0 ? (
              data.map((item, idx) => <DetailItem key={idx} {...item} />)
            ) : (
              <div>주문 내역에 아무것도 없습니다.</div>
            )
          ) : (
            <div>불러오는 중...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
const DetailItem = (props: OrderDetail) => {
  return (
    <div
      className="w-full flex p-4 rounded-sm"
      style={{ border: "1px solid grey" }}
    >
      <div>
        <span>{ORDER_STATUS_MAP[props.status + 1]}</span>
        {props.orderItems.map((item, idx) => (
          <Item key={idx} {...item} />
        ))}
      </div>
    </div>
  );
};

const Item = (props: OrderItemDetail) => {
  const router = useRouter();

  const [quantity, setQuantity] = useState<number | undefined>(props.quantity);
  const [cost, setCost] = useState<number>(props.quantity);
  useEffect(() => {
    if (quantity != null) {
      setCost(quantity * props.eachPrice);
    }
  }, [quantity, props.eachPrice]);

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
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{cost.toLocaleString("ko-kr")} 원</span>
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
