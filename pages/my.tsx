import { CountControl } from "@/components/CountControl";
import { ORDER_QUERY_KEY, ORDER_STATUS_MAP } from "@/constants/products";
import styled from "@emotion/styled";
import { Cart, OrderItem, Orders } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Badge, Button } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { format } from "date-fns";

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
  const queryClient = useQueryClient();
  const { mutate: updateOrderStatus } = useMutation<
    unknown,
    unknown,
    number,
    any
  >(
    (status) =>
      fetch(`/api/update-order-status`, {
        method: "POST",
        body: JSON.stringify({
          id: props.id,
          status: status,
          userId: props.userId,
        }),
      })
        .then((res) => res.json())
        .then((data) => data.items),
    {
      onMutate: async (status) => {
        await queryClient.cancelQueries([ORDER_QUERY_KEY]);
        // 현재 값 가져오기
        const previous = queryClient.getQueryData([ORDER_QUERY_KEY]);
        // 그 가져온 현재의 값을 리턴하고, 있었다면 빼버리고, 없었다면 추가한 상태로 리턴
        queryClient.setQueryData<Cart[]>([ORDER_QUERY_KEY], (old) =>
          old?.map((item) => {
            if (item.id === props.id) {
              return { ...item, status: status };
            }
            return item;
          })
        );
        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueryData([ORDER_QUERY_KEY], context.previous);
      },
      onSuccess: () => {
        queryClient.invalidateQueries([ORDER_QUERY_KEY]);
      },
    }
  );
  const onHandleUpdate = () => {
    // 주문 status update 배송 완료로
    updateOrderStatus(5);
  };

  const onHandleCancel = () => {
    // 주문 status -1 로
    updateOrderStatus(-1);
  };

  return (
    <div
      className="w-full flex flex-col p-4 rounded-md"
      style={{ border: "1px solid grey" }}
    >
      <div className="flex">
        <Badge color={props.status < 1 ? "red" : ""} className="mb-2">
          {ORDER_STATUS_MAP[props.status + 1]}
        </Badge>
        <IconX className="ml-auto" onClick={onHandleCancel} />
      </div>
      <div>
        {props.orderItems.map((item, idx) => (
          <Item key={idx} {...item} />
        ))}
        <div className="flex mt-4">
          <div className="flex flex-col">
            <span className="mb-2">주문 정보</span>
            <span>받는 사람: {props.receiver ?? "입력 필요"}</span>
            <span>주소: {props.address ?? "입력 필요"}</span>
            <span>연락처: {props.phoneNumber ?? "입력 필요"}</span>
          </div>
          <div className="flex flex-col ml-auto mr-4 text-right">
            <span className="font-semibold mb-2">
              합계 금액:{" "}
              <span className="text-red-500">
                {props.orderItems
                  .map((item) => item.totalprice)
                  .reduce((prev, cur) => prev + cur, 0)
                  .toLocaleString("ko-kr")}{" "}
                원
              </span>
            </span>
            <span className="text-zimc-400 mt-auto mb-auto">
              주문 일자:{" "}
              {format(new Date(props.createdAt), "yyyy년 M월 d일 HH:mm:ss")}
            </span>
            <Button
              style={{ backgroundColor: "black", color: "white" }}
              onClick={onHandleUpdate}
            >
              결제 처리
            </Button>
          </div>
        </div>
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
