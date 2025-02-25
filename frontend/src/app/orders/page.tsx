"use client";
import React, { useEffect, useState, useCallback } from "react";
import api from "../../lib/axios";
import Link from "next/link";

interface OrderItem {
  itemId: number;
  quantity: number;
  itemName: string;
}

interface OrderItemsGroup {
  tradeUUID: string;
  orderItemDtoList: OrderItem[];
}

interface OrdersResponse {
  buyList: OrderItemsGroup[]; // BUY 상태 (일반 주문)
  payList: OrderItemsGroup[]; // PAY 상태 (결제 완료)
  prepareDeliveryList: OrderItemsGroup[]; // PREPARE_DELIVERY 상태 (배송 준비중)
  beforeDeliveryList: OrderItemsGroup[]; // BEFORE_DELIVERY 상태 (배송 전)
  inDeliveryList: OrderItemsGroup[]; // IN_DELIVERY 상태 (배송중)
  postDeliveryList: OrderItemsGroup[];
  refusedList: OrderItemsGroup[];
  refundList: OrderItemsGroup[];
}

export default function OrderPage() {
  const [orders, setOrders] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // fetchOrders를 useCallback으로 분리해서 상태 변경 후 재호출 가능하도록 함.
  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }
      const endpoint = isAdmin ? "/admin/trade/all-trades" : "/order/show";
      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.msg || "주문 목록을 불러오지 못했습니다.");
      setLoading(false);
    }
  }, [isAdmin]);

  // 토큰 디코딩을 통해 권한 확인
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        setIsAdmin(payload.authority === "ADMIN");
      } catch (e) {
        console.error("토큰 디코딩 중 오류 발생", e);
      }
    }
  }, []);

  // isAdmin 상태가 결정되면 주문 데이터 호출
  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchOrders();
    }
  }, [fetchOrders]);

  // 주문 상태 변경 함수: 각 엔드포인트에 쿼리 파라미터 방식으로 전송
  const updateOrderStatus = async (tradeUUID: string, endpoint: string) => {
    try {
      const token = localStorage.getItem("token");
      const params: any = { tradeUUID };
      if (endpoint === "confirm") {
        params.changeToDeliveryReady = true;
      }
      await api.post(`/admin/trade/${endpoint}`, null, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("주문 상태가 변경되었습니다.");
      // 전체 페이지 리로드 대신 주문 데이터를 다시 불러옴
      fetchOrders();
    } catch (error) {
      alert("주문 상태 변경에 실패했습니다.");
      console.error(error);
    }
  };

  // 주문 그룹 렌더링: 상태별 버튼은 관리자인 경우에만 표시
  const renderOrderGroup = (orderGroups: OrderItemsGroup[], status: string) => {
    if (orderGroups.length === 0) {
      return <p>해당 상태의 주문이 없습니다.</p>;
    }
    return orderGroups.map((group, groupIndex) => (
      <div key={groupIndex} className="border p-2 rounded mb-2">
        <p>거래 ID: {group.tradeUUID}</p>
        {group.orderItemDtoList.map((item, itemIndex) => (
          <div key={itemIndex} className="ml-4">
            <p>상품명: {item.itemName}</p>
            <p>수량: {item.quantity}</p>
          </div>
        ))}
        {isAdmin && (
          <div className="mt-2">
            {status === "payList" && (
              <button
                onClick={() => updateOrderStatus(group.tradeUUID, "confirm")}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                확인
              </button>
            )}
            {status === "prepareDeliveryList" && (
              <button
                onClick={() => updateOrderStatus(group.tradeUUID, "prepare")}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                배송 준비
              </button>
            )}
            {status === "beforeDeliveryList" && (
              <button
                onClick={() =>
                  updateOrderStatus(group.tradeUUID, "in-delivery")
                }
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                배송 시작
              </button>
            )}
            {status === "inDeliveryList" && (
              <button
                onClick={() =>
                  updateOrderStatus(group.tradeUUID, "post-delivery")
                }
                className="bg-purple-500 text-white px-3 py-1 rounded"
              >
                배송 완료
              </button>
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          내 주문 목록 {isAdmin ? "(관리자)" : ""}
        </h1>
        <Link href="/" className="underline">
          메인 페이지로
        </Link>
      </header>
      <main className="container mx-auto py-8">
        {loading ? (
          <div className="text-center">주문 목록 로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : orders ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">주문 현황</h2>

            {/* BUY 상태는 관리 작업 대상이 아니므로 버튼 미표시 */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">주문 대기 (BUY)</h3>
              {renderOrderGroup(orders.buyList, "buyList")}
            </section>

            {/* 결제 완료 (PAY): 확인 버튼 */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">결제 완료 (PAY)</h3>
              {renderOrderGroup(orders.payList, "payList")}
            </section>

            {/* 배송 준비중 (PREPARE_DELIVERY): 배송 준비 버튼 */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                배송 준비중 (PREPARE_DELIVERY)
              </h3>
              {renderOrderGroup(
                orders.prepareDeliveryList,
                "prepareDeliveryList"
              )}
            </section>

            {/* 배송 전 (BEFORE_DELIVERY): 배송 시작 버튼 */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                배송 전 (BEFORE_DELIVERY)
              </h3>
              {renderOrderGroup(
                orders.beforeDeliveryList,
                "beforeDeliveryList"
              )}
            </section>

            {/* 배송중 (IN_DELIVERY): 배송 완료 버튼 */}
            <section className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                배송중 (IN_DELIVERY)
              </h3>
              {renderOrderGroup(orders.inDeliveryList, "inDeliveryList")}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
