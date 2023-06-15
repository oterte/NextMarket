export const CATEGORY_MAP = ["Sneakers", "T-shirt", "Pants", "Cap", "Hoodie"];
export const Take = 9;
export const FILTERS = [
  {
    label: "최신순",
    value: "latest",
  },
  {
    label: "가격 높은 순",
    value: "expensive",
  },
  {
    label: "가격 낮은 순",
    value: "cheap",
  },
];

export const getOrderBy = (orderBy?: string) => {
  return orderBy
    ? orderBy === "latest"
      ? { orderBy: { createdAt: "desc" } }
      : orderBy === "expensive"
      ? { orderBy: { price: "desc" } }
      : { orderBy: { price: "asc" } }
    : undefined;
};

export const CART_QUERY_KEY = "/api/get-cart";

export const ORDER_QUERY_KEY = "/api/get-order";

export const ORDER_STATUS_MAP = [
  "주문취소",
  "주문대기",
  "결제대기",
  "결제완료",
  "배송대기",
  "배송중",
  "배송완료",
  "환불대기",
  "환불완료",
  "반품대기",
  "반품완료",
];
