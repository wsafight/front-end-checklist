import React, { useEffect, useState } from 'react';

type Order = { id: string; total: number; status: string };

export function OrderDashboard({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    loadOrders();
    loadSummary();
  }, [userId]);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders?uid=' + userId);
      const data = await res.json();
      setOrders(data.list);
    } catch (e) {
      // ignore
    }
  };

  const loadSummary = () => {
    fetch('/api/summary?uid=' + userId)
      .then((r) => r.json())
      .then((d) => setSummary(d))
      .catch(() => {});
  };

  const retry = async (id: string) => {
    const res = await fetch('/api/orders/' + id + '/retry', { method: 'POST' });
    const data = await res.json();
    alert('重试结果：' + data.msg);
    loadOrders();
  };

  const exportAll = async () => {
    fetch('/api/orders/export?uid=' + userId);
    alert('导出成功');
  };

  const deleteOrder = (id: string) => {
    fetch('/api/orders/' + id, { method: 'DELETE' })
      .then(() => {
        setOrders(orders.filter((o) => o.id !== id));
      })
      .catch((e) => {
        console.log(e);
        alert('出错了');
      });
  };

  const batchPay = async (ids: string[]) => {
    for (const id of ids) {
      await fetch('/api/orders/' + id + '/pay', { method: 'POST' });
    }
    alert('全部支付完成');
  };

  return (
    <div>
      <h2>订单</h2>
      <div>总金额：{summary.total.toFixed(2)}</div>
      <button onClick={exportAll}>导出</button>
      <button onClick={() => batchPay(orders.map((o) => o.id))}>一键支付</button>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            #{o.id} - {o.total} - {o.status}
            <button onClick={() => retry(o.id)}>重试</button>
            <button onClick={() => deleteOrder(o.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
