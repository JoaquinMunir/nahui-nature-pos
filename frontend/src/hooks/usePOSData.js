import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { db } from '../db';
import { formatProduct } from '../utils/constants';
import { groupBy } from '../utils/groupBy';

export function usePOSData({ 
  ENDPOINTS, setAppAlert, fetchInventories, saleMode, 
  setMobileInventory, setCentralInventory, isOnRoad, 
  clearCart, setIsSubmitting 
}) {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [routes, setRoutes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(() => !navigator.onLine);
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [sendWhatsApp, setSendWhatsApp] = useState(() => localStorage.getItem('sendWhatsApp') !== 'false');
  const groupedProducts = useMemo(() => groupBy(products, (product) => product.category), [products]);
  const categoryNames = useMemo(() => Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b, 'es')), [groupedProducts]);
  const groupedClients = useMemo(() => groupBy(clients, (client) => client.location), [clients]);
  const locationNames = useMemo(() => Object.keys(groupedClients).sort((a, b) => a.localeCompare(b, 'es')), [groupedClients]);
  
  // Controladores de estado de red
  useEffect(() => {
    const handleOffline = () => {
      setIsOfflineMode(true);
      setAppAlert({ isOpen: true, title: 'Señal Perdida', message: 'Entrando a modo offline. Puedes seguir vendiendo.', type: 'warning' });
    };
    const handleOnline = () => {
      setIsOfflineMode(false);
      setAppAlert({ isOpen: true, title: 'Conexión Recuperada', message: 'Sincronizando datos en segundo plano...', type: 'success' });
      fetchInventories();
    };

    window.addEventListener('offline', handleOffline);  
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchInventories, setAppAlert]);

  // Sincronización y Carga Inicial
  useEffect(() => {
    const syncOfflineData = async () => {
      try {
        const offlineClients = await db.sync_clients_queue.toArray();
        for (const client of offlineClients) {
          try {
            const res = await axios.post(ENDPOINTS.clients, client);
            if (res.data.status === 'success') await db.sync_clients_queue.delete(client.id);
          } catch { break; }
        }
      } catch (err) { console.error('Error leyendo la cola de clientes:', err); }

      try {
        const offlineOrders = await db.sync_queue.toArray();
        for (const order of offlineOrders) {
          try {
            const res = await axios.post(ENDPOINTS.orders, order);
            if (res.data.status === 'success') await db.sync_queue.delete(order.id); 
          } catch (err) { 
            if (err.response && err.response.status === 400) await db.sync_queue.delete(order.id);
            else break; 
          }
        }
      } catch (err) { console.error('Error leyendo la cola de ventas:', err); }

      try {
        const offlineSessions = await db.sync_sessions_queue.toArray();
        for (const session of offlineSessions) {
          try {
            const res = await axios.post(ENDPOINTS.sessions, session);
            if (res.data.status === 'success') await db.sync_sessions_queue.delete(session.id);
          } catch { break; }
        }
      } catch (err) { console.error('Error leyendo la cola de cortes:', err); }
    };
    
    const fetchInitialData = async () => {
      try {
        const [resProducts, resClients, resRoutes, resOrders] = await Promise.all([
          axios.get(ENDPOINTS.products), axios.get(ENDPOINTS.clients), axios.get(ENDPOINTS.routes), axios.get(ENDPOINTS.orders).catch(() => null) 
        ]);
        
        if (resProducts.data.status === 'success' && resClients.data.status === 'success' && resRoutes.data.status === 'success') {
          setProducts(resProducts.data.data);
          setClients(resClients.data.data);
          setRoutes(resRoutes.data.data);
          
          if (resOrders && resOrders.data && resOrders.data.status === 'success') {
            setOrdersHistory(resOrders.data.data);
            localStorage.setItem('offline_orders_history', JSON.stringify(resOrders.data.data));
          }
          
          await db.products.clear(); await db.products.bulkPut(resProducts.data.data);
          await db.clients.clear(); await db.clients.bulkPut(resClients.data.data);
          await db.routes.clear(); await db.routes.bulkPut(resRoutes.data.data);
          
          setIsOfflineMode(false);
          syncOfflineData(); 
        }
      } catch (err) {
        console.error("Error en conexión inicial:", err);
        try {
          let localProducts = await db.products.toArray();
          let localClients = await db.clients.toArray();
          let localRoutes = await db.routes.toArray();
          const localOrders = JSON.parse(localStorage.getItem('offline_orders_history')) || [];
          
          setOrdersHistory(localOrders);
          if (localProducts.length > 0 || localClients.length > 0) {
            localProducts.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
            localClients.sort((a, b) => (a.location || '').localeCompare(b.location || '') || a.name.localeCompare(b.name));
            localRoutes.sort((a, b) => a.name.localeCompare(b.name));

            setProducts(localProducts); setClients(localClients); setRoutes(localRoutes);
            setIsOfflineMode(true); 
          } else { setError("Error: El servidor no responde y no hay datos guardados localmente."); }
        } catch (localErr) {
          console.error('Error leyendo datos locales:', localErr);
          setError('Error de almacenamiento local.');
        }
      } finally { setLoading(false); }
    };

    fetchInitialData();
  }, [ENDPOINTS]);

  // Generador de Ticket WhatsApp
  const sendWhatsAppTicket = (client, cart, totalAmount) => {
    if (!client || !client.phone_number) return; 
    let phone = client.phone_number.replace(/\D/g, '');
    if (phone.length === 10) phone = `52${phone}`; 

    let text = `*🌿 NAHUI NATURE - COMPROBANTE DE VENTA 🌿*\n\n👤 *Cliente:* ${client.name}\n📅 *Fecha:* ${new Date().toLocaleDateString()}\n\n*🛍 DETALLE DEL PEDIDO:*\n`;
    cart.forEach(item => {
      const { cartTitle, cartSubtitle } = formatProduct(item);
      const nombreFinal = cartSubtitle ? `${cartTitle} ${cartSubtitle}` : cartTitle;
      text += `▪️ ${item.quantity}x ${nombreFinal} - $${(item.price * item.quantity).toFixed(2)}\n`; 
    });
    text += `\n💰 *TOTAL: $${totalAmount.toFixed(2)}*\n\n¡Gracias por tu preferencia! 🌱`;

    const encodedText = encodeURIComponent(text);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    window.open(isMobile ? `https://wa.me/${phone}?text=${encodedText}` : `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`, '_blank');
  };

  // Procesador de Cobros
  const handleCheckout = async (cart, totalOrder) => {
    if (cart.length === 0 || !activeClient) return;
    setIsSubmitting(true);
    
    const payload = {
      id: crypto.randomUUID(), client_id: activeClient.id, total_amount: totalOrder, created_at: new Date().toISOString(), sale_mode: saleMode,
      items: cart.map(item => ({ id: crypto.randomUUID(), product_id: item.id, quantity: item.quantity, unit_price: item.price, subtotal: item.price * item.quantity }))
    };

    const newOrderHistoryItem = {
      id: payload.id, client_name: activeClient.name, client_location: activeClient.location, client_address: activeClient.address, total_amount: payload.total_amount, created_at: payload.created_at,
      items: cart.map(item => ({ product_name: item.name, category: item.category, quantity: item.quantity, subtotal: item.price * item.quantity }))
    };

    const updateLocalHistory = () => {
      setOrdersHistory(prev => {
        const updated = [newOrderHistoryItem, ...prev];
        localStorage.setItem('offline_orders_history', JSON.stringify(updated));
        return updated;
      });
    };

    try {
      const res = await axios.post(ENDPOINTS.orders, payload);
      if (sendWhatsApp) sendWhatsAppTicket(activeClient, cart, totalOrder);      
      if (res.data.status === 'success') { 
        if (isOnRoad) {
          localStorage.setItem('shiftSales', (parseFloat(localStorage.getItem('shiftSales') || '0') + totalOrder).toString());
          localStorage.setItem('shiftOrderCount', (parseInt(localStorage.getItem('shiftOrderCount') || '0') + 1).toString());
        }
        updateLocalHistory(); 
        clearCart(); setActiveClient(null); 
      }
      fetchInventories();
    	} catch {
      try {
        await db.sync_queue.add(payload);
        if (sendWhatsApp) sendWhatsAppTicket(activeClient, cart, totalOrder);
        
        if (isOnRoad) {
          localStorage.setItem('shiftSales', (parseFloat(localStorage.getItem('shiftSales') || '0') + totalOrder).toString());
          localStorage.setItem('shiftOrderCount', (parseInt(localStorage.getItem('shiftOrderCount') || '0') + 1).toString());
        }

        const setInventory = saleMode === 'mobile' ? setMobileInventory : setCentralInventory;
        const localTable = saleMode === 'mobile' ? db.mobile_inventory : db.central_inventory;

        setInventory(prev => prev.map(inv => {
          const soldItem = payload.items.find(i => String(i.product_id) === String(inv.product_id));
          if (soldItem) {
            const newStock = inv.stock_quantity - soldItem.quantity;
            localTable.update(inv.product_id, { stock_quantity: newStock }).catch(()=>{});
            return { ...inv, stock_quantity: newStock };
          }
          return inv;
        }));

        updateLocalHistory(); clearCart(); setActiveClient(null);
      } catch (dbError) { 
        console.error('Error guardando la venta offline:', dbError);
        setAppAlert({ isOpen: true, title: 'Error Crítico', message: 'Error al procesar la orden offline.', type: 'error' });
      }
    } finally { setIsSubmitting(false); }
  };

  return {
    products, setProducts, clients, setClients, routes, setRoutes,
    loading, error, isOfflineMode, ordersHistory, setOrdersHistory,
    activeClient, setActiveClient, sendWhatsApp, setSendWhatsApp, 
    groupedProducts, categoryNames, groupedClients, locationNames,
    handleCheckout
  };
}