import { useState } from 'react';
import axios from 'axios';
import { db } from '../db';

export function useRouteSession({ ENDPOINTS, setAppAlert, setShowInventory, setShowOrders, setShowRouteLoadModal }) {
  const [showShiftReport, setShowShiftReport] = useState(false);
  const [shiftStats, setShiftStats] = useState({ totalSales: 0, totalExpenses: 0, orderCount: 0, netCash: 0 });
  const [isOnRoad, setIsOnRoad] = useState(() => localStorage.getItem('isOnRoad') === 'true');
  const [saleMode, setSaleMode] = useState(() => (localStorage.getItem('isOnRoad') === 'true' ? 'mobile' : 'central'));
  const [shiftStartTime, setShiftStartTime] = useState(() => localStorage.getItem('shiftStartTime') || null);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('routeExpenses')) || []);
  const [expenseModal, setExpenseModal] = useState({ isOpen: false, concept: '', amount: '' });

  const handleStartRoute = () => {
    setIsOnRoad(true);
    const startTime = new Date().toISOString();
    setShiftStartTime(startTime);
    localStorage.setItem('isOnRoad', 'true');
    localStorage.setItem('shiftStartTime', startTime);
    localStorage.setItem('shiftSales', '0');       
    localStorage.setItem('shiftOrderCount', '0');  
    setSaleMode('mobile'); 
    
    setShowRouteLoadModal(true);
    setShowInventory(false);
    setShowOrders(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(expenseModal.amount);
    if (isNaN(amount) || amount <= 0 || !expenseModal.concept) return;

    const newExpense = { id: crypto.randomUUID(), concept: expenseModal.concept, amount: amount, time: new Date().toISOString() };
    const updatedExpenses = [...expenses, newExpense];
    
    setExpenses(updatedExpenses);
    localStorage.setItem('routeExpenses', JSON.stringify(updatedExpenses));
    setExpenseModal({ isOpen: false, concept: '', amount: '' });
  };

  const handleEndRoute = () => {
    const totalSales = parseFloat(localStorage.getItem('shiftSales') || '0');
    const orderCount = parseInt(localStorage.getItem('shiftOrderCount') || '0');
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    setShiftStats({
      totalSales,
      totalExpenses,
      orderCount,
      netCash: totalSales - totalExpenses
    });

    setShowShiftReport(true);
  };

  const confirmEndRoute = async () => {
    const sessionPayload = {
      id: crypto.randomUUID(),
      start_time: shiftStartTime || new Date().toISOString(),
      end_time: new Date().toISOString(),
      total_sales: shiftStats.totalSales,
      total_expenses: shiftStats.totalExpenses,
      net_cash: shiftStats.netCash,
      order_count: shiftStats.orderCount,
      expenses: expenses.map(e => ({
        id: e.id,
        concept: e.concept,
        amount: e.amount,
        created_at: e.time
      }))
    };

    try {
      await axios.post(ENDPOINTS.sessions, sessionPayload);
    } catch {
      await db.sync_sessions_queue.add(sessionPayload).catch(()=>{});
      setAppAlert({ 
        isOpen: true, 
        title: 'Guardado Local', 
        message: 'Modo sin conexión: El corte se guardó en tu dispositivo y se subirá en cuanto regrese el internet.', 
        type: 'warning' 
      });
    }

    setIsOnRoad(false);
    setSaleMode('central');
    setShiftStartTime(null);
    setExpenses([]); 
    localStorage.removeItem('isOnRoad');
    localStorage.removeItem('shiftStartTime');
    localStorage.removeItem('routeExpenses');
    localStorage.removeItem('shiftSales');
    localStorage.removeItem('shiftOrderCount');
    
    setShowShiftReport(false);
  };

  return {
    showShiftReport, setShowShiftReport,
    shiftStats, setShiftStats,
    isOnRoad, setIsOnRoad,
    saleMode, setSaleMode,
    shiftStartTime, setShiftStartTime,
    expenses, setExpenses,
    expenseModal, setExpenseModal,
    handleStartRoute, handleAddExpense, handleEndRoute, confirmEndRoute
  };
}