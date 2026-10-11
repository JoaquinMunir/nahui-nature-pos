import { useMemo, useState } from 'react';

// Convierte una fecha ISO a "AAAA-MM-DD" en la zona horaria del dispositivo,
// el mismo formato que devuelve <input type="date">.
const toLocalDateKey = (isoString) => {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export function useSalesHistory(ordersHistory) {
  const [searchOrder, setSearchOrder] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const filteredOrders = useMemo(() => {
    const term = searchOrder.toLowerCase();
    return ordersHistory.filter((order) => {
      const matchesSearch = [order.client_name, order.client_location, order.client_address]
        .some((field) => (field || '').toLowerCase().includes(term));
      const matchesDate = !filterDate || toLocalDateKey(order.created_at) === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [ordersHistory, searchOrder, filterDate]);

  const totalFilteredRevenue = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
    [filteredOrders],
  );

  return {
    searchOrder, setSearchOrder,
    filterDate, setFilterDate,
    expandedOrderId, setExpandedOrderId,
    filteredOrders, totalFilteredRevenue,
  };
}