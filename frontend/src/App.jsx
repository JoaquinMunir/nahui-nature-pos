import { useState, useEffect } from 'react'
import axios from 'axios'
import { db } from './db' 

import AppAlertModal from './components/modals/AppAlertModal';
import ExpenseModal from './components/modals/ExpenseModal';
import ShiftReportModal from './components/modals/ShiftReportModal';
import RouteLoadModal from './components/modals/RouteLoadModal';
import TransferModal from './components/modals/TransferModal';
import RestockModal from './components/modals/RestockModal';
import POSHeader from './components/pos/POSHeader';
import CartSidebar from './components/pos/CartSidebar';

const API_URL = import.meta.env.VITE_API_URL || "https://nahui-nature-api.onrender.com";

const ENDPOINTS = {
  products: `${API_URL}/products`,
  clients:  `${API_URL}/clients`,
  routes:   `${API_URL}/routes`,
  orders:   `${API_URL}/orders`,
  inventory: `${API_URL}/inventory/central`,
  mobileInventory: `${API_URL}/inventory/mobile`,
  transfer: `${API_URL}/inventory/transfer`,
  sessions: `${API_URL}/sessions`
};

const CATEGORY_COVERS = {
  "Cecina": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/dried_beef.jpg",
  "Chips del huerto": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/veggie_chips.jpg",
  "Chocohojuelas artesanales": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/chocohojuela.jpg",
  "Lentejas con limón y chile": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/lenteja_.jpg",
  "Nubes de maíz": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/maicitos.jpg",
  "Obleas tradición de amaranto": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/obleas_.jpg",
  "Platanitos crujientes": "https://drwsqimkucepjqlqsoxd.supabase.co/storage/v1/object/public/covers/platanitos.jpg",
};

const formatProduct = (product) => {
  const isSingle = product.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'unico';

  const getCategoryColor = (category) => {
    const cat = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (cat.includes('oblea')) return "#F17E92";
    if (cat.includes('chocohojuela')) return "#3B2216";
    if (cat.includes('chip')) return "#5B8A3C";
    if (cat.includes('nube')) return "#F3D36B";
    if (cat.includes('lenteja')) return "#953431";
    if (cat.includes('platanito')) return "#E4B647";
    if (cat.includes('cecina') || cat.includes('carne')) return "#2B1010";
    return "#7B502B"; 
  };

  const getFlavorColor = (flavor) => {
    const f = flavor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (f.includes('natural')) return "bg-[#F3D36B] text-[#F8F6EF]";
    if (f.includes('queso')) return "bg-[#ffce33] text-[#F8F6EF]";
    if (f.includes('negra')) return "bg-[#3b2418] text-[#F8F6EF]";
    if (f.includes('jalapeno')) return "bg-[#6e9550] text-[#F8F6EF]";
    if (f.includes('fuego')) return "bg-[#bc584b] text-[#F8F6EF]";
    if (f.includes('ranchero')) return "bg-[#c2774e] text-[#F8F6EF]";
    if (f.includes('adobad')) return "bg-[#8b2c15] text-[#F8F6EF]";
    if (f.includes('habanero')) return "bg-[#d97216] text-[#F8F6EF]";
    if (f.includes('limon')) return "bg-[#5B8A3C] text-[#F8F6EF]";
    if (f.includes('arcoiris')) return "bg-[#C48BE0] text-[#F8F6EF]";
    if (f.includes('cafe')) return "bg-[#A67B5B] text-[#F8F6EF]";
    if (f.includes('chocolate')) return "bg-[#905B3C] text-[#F8F6EF]";
    if (f.includes('coco')) return "bg-[#D1BBA1] text-[#F8F6EF]";
    if (f.includes('frutos rojos')) return "bg-[#F58294] text-[#F8F6EF]";
    if (f.includes('maracuya')) return "bg-[#E4CF65] text-[#F8F6EF]";
    if (f.includes('matcha')) return "bg-[#BFBB7E] text-[#F8F6EF]";
    if (f.includes('mora azul')) return "bg-[#C3BBE5] text-[#F8F6EF]";
    if (f.includes('nuez')) return "bg-[#D7BEA4] text-[#F8F6EF]";
    if (f.includes('taro')) return "bg-[#B7A2CD] text-[#F8F6EF]";

    return "bg-[#7B502B] text-[#F8F6EF]"; 
  };

  return {
    title: product.category,
    catColor: getCategoryColor(product.category),
    badge: isSingle ? null : { text: product.name, colorClass: getFlavorColor(product.name) },
    cartTitle: product.category,
    cartSubtitle: isSingle ? null : product.name,
    cartSubtitleColor: getFlavorColor(product.name),
  };
};

const SUPPLIERS = [
  { id: 1, name: "Cecina", emoji: "🥩", link: "https://wa.me/5213318957640" },
  { id: 2, name: "Chips", emoji: "🌿", link: "https://wa.me/5213310643081" },
  { id: 3, name: "Lentejas", emoji: "🌶", link: "https://wa.me/5218128683071" },
  { id: 4, name: "Maicitos", emoji: "🌽", link: "https://wa.me/5213328286378" },
  { id: 5, name: "Obleas", emoji: "🌾", link: "https://wa.me/5217353384879" },
  { id: 6, name: "Platanitos", emoji: "🍌", link: "https://wa.me/5213121129537" },
];

function App() {
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [routes, setRoutes] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [appAlert, setAppAlert] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  const [activeClient, setActiveClient] = useState(null)
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [ordersHistory, setOrdersHistory] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [searchOrder, setSearchOrder] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(() => localStorage.getItem('sendWhatsApp') !== 'false');

  const [searchInv, setSearchInv] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [centralInventory, setCentralInventory] = useState([]);
  const [mobileInventory, setMobileInventory] = useState([]);
  const [showRouteLoadModal, setShowRouteLoadModal] = useState(false);
  const [routeLoadCart, setRouteLoadCart] = useState({});
  
  const [saleMode, setSaleMode] = useState(() => {
    const onRoad = localStorage.getItem('isOnRoad') === 'true';
    return onRoad ? 'mobile' : 'central';
  });

  const [stockInputs, setStockInputs] = useState({});
  const [transferModal, setTransferModal] = useState({ isOpen: false, product: null, stockCasa: 0, qty: '' });

  const [expandedInvCategories, setExpandedInvCategories] = useState({});
  const toggleInvCategory = (cat) => setExpandedInvCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [expandedWeights, setExpandedWeights] = useState({})
  const [expandedLocations, setExpandedLocations] = useState({})

  const [isAddingClient, setIsAddingClient] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [clientForm, setClientForm] = useState({
    name: '', contact: '', phone_number: '', address: '', location: '', route_name: '', latitude: '', longitude: ''
  })

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockCart, setRestockCart] = useState({}); 

  const handleBulkRestock = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const itemsToUpdate = Object.entries(restockCart).filter(([id, qty]) => qty > 0);
      if (itemsToUpdate.length === 0) {
        setAppAlert({ isOpen: true, title: 'Atención', message: 'Agrega al menos una cantidad para reabastecer.', type: 'warning' });
        setIsSubmitting(false);
        return;
      }
      const promises = itemsToUpdate.map(([id, qty]) => 
        axios.post(`${ENDPOINTS.inventory}/add`, { product_id: id, quantity: qty })
      );
      await Promise.all(promises);
      setShowRestockModal(false);
      setRestockCart({});
      fetchInventories(); 
      setAppAlert({ isOpen: true, title: 'Éxito', message: '¡Reabastecimiento exitoso! La Bodega Central ha sido actualizada.', type: 'success' });
    } catch (error) {
      setAppAlert({ isOpen: true, title: 'Error', message: 'Error al conectar con la base de datos para el reabastecimiento.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showShiftReport, setShowShiftReport] = useState(false);
  const [shiftStats, setShiftStats] = useState({ totalSales: 0, totalExpenses: 0, orderCount: 0, netCash: 0 });

  const [isOnRoad, setIsOnRoad] = useState(() => localStorage.getItem('isOnRoad') === 'true');
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

  const handleBulkRouteLoad = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const itemsToTransfer = Object.entries(routeLoadCart).filter(([id, qty]) => qty > 0);
      if (itemsToTransfer.length === 0) {
        setShowRouteLoadModal(false); 
        return;
      }

      for (const [id, qty] of itemsToTransfer) {
        const stockCasa = centralInventory.find(i => String(i.product_id) === String(id))?.stock_quantity || 0;
        if (qty > stockCasa) {
          setAppAlert({ isOpen: true, title: 'Stock Insuficiente', message: `Estás intentando cargar más mercancía de la que existe en Central.`, type: 'error' });
          setIsSubmitting(false);
          return;
        }
      }

      const promises = itemsToTransfer.map(([id, qty]) => 
        axios.post(ENDPOINTS.transfer, { product_id: id, quantity: qty, route_name: "Ruta 1" })
      );

      await Promise.all(promises);
      await fetchInventories();

      setShowRouteLoadModal(false);
      setRouteLoadCart({});
      setAppAlert({ isOpen: true, title: '¡Camioneta Lista!', message: 'Mercancía cargada a la unidad exitosamente. ¡Buen viaje!', type: 'success' });
    } catch (error) {
      setAppAlert({ isOpen: true, title: 'Error', message: 'Hubo un problema al cargar la camioneta.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
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
    } catch (error) {
      await db.sync_sessions_queue.add(sessionPayload).catch(()=>{});
      setAppAlert({ 
        isOpen: true, 
        title: 'Guardado Local', 
        message: 'Modo sin conexión: El corte se guardó en tu dispositivo y se subirá en cuanto regrese el internet.', 
        type: 'warning' 
      });
    }

    setIsOnRoad(false);
    setShiftStartTime(null);
    setExpenses([]); 
    localStorage.removeItem('isOnRoad');
    localStorage.removeItem('shiftStartTime');
    localStorage.removeItem('routeExpenses');
    localStorage.removeItem('shiftSales');
    localStorage.removeItem('shiftOrderCount');
    
    setShowShiftReport(false);
  };
  
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

    if (!navigator.onLine) {
      setIsOfflineMode(true);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

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

  const fetchInventories = async () => {
    try {
      const [centralRes, mobileRes] = await Promise.all([
        axios.get(ENDPOINTS.inventory),
        axios.get(ENDPOINTS.mobileInventory)
      ]);
      
      let cData = [];
      let mData = [];

      if (centralRes.data.status === 'success') {
        cData = centralRes.data.data;
        setCentralInventory(cData);
      }
      if (mobileRes.data.status === 'success') {
        mData = mobileRes.data.data;
        setMobileInventory(mData);
      }

      try {
        if (cData.length > 0) {
          await db.central_inventory.clear();
          await db.central_inventory.bulkPut(cData);
        }
        if (mData.length > 0) {
          await db.mobile_inventory.clear();
          await db.mobile_inventory.bulkPut(mData);
        }
      } catch (saveError) {
        console.error("Dexie bloqueó el guardado:", saveError);
      }
    } catch (error) {
      console.warn("Sin conexión: Cargando inventarios desde la memoria del dispositivo...");
      try {
        const localCentral = await db.central_inventory.toArray();
        const localMobile = await db.mobile_inventory.toArray();
        
        if (localCentral.length > 0) setCentralInventory(localCentral);
        if (localMobile.length > 0) setMobileInventory(localMobile);
      } catch (dbError) {
        console.error("Error leyendo memoria local:", dbError);
      }
    }
  };

  useEffect(() => {
    fetchInventories(); 
  }, []);

  useEffect(() => {
    const syncOfflineData = async () => {
      try {
        const offlineClients = await db.sync_clients_queue.toArray();
        for (const client of offlineClients) {
          try {
            const res = await axios.post(ENDPOINTS.clients, client);
            if (res.data.status === 'success') await db.sync_clients_queue.delete(client.id);
          } catch (err) { break; }
        }
      } catch (err) {}

      try {
        const offlineOrders = await db.sync_queue.toArray();
        for (const order of offlineOrders) {
          try {
            const res = await axios.post(ENDPOINTS.orders, order);
            if (res.data.status === 'success') {
              await db.sync_queue.delete(order.id); 
            }
          } catch (err) { 
            if (err.response && err.response.status === 400) {
              await db.sync_queue.delete(order.id);
            } else {
              break; 
            }
          }
        }
      } catch (err) {}

      try {
        const offlineSessions = await db.sync_sessions_queue.toArray();
        for (const session of offlineSessions) {
          try {
            const res = await axios.post(ENDPOINTS.sessions, session);
            if (res.data.status === 'success') {
              await db.sync_sessions_queue.delete(session.id);
            }
          } catch (err) { break; }
        }
      } catch (err) {}
    };
    
    const fetchInitialData = async () => {
      try {
        const [resProducts, resClients, resRoutes, resOrders] = await Promise.all([
          axios.get(ENDPOINTS.products),
          axios.get(ENDPOINTS.clients),
          axios.get(ENDPOINTS.routes),
          axios.get(ENDPOINTS.orders).catch(() => null) 
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

            setProducts(localProducts);
            setClients(localClients);
            setRoutes(localRoutes);
            setIsOfflineMode(true); 
          } else {
            setError("Error: El servidor no responde y no hay datos guardados localmente.");
          }
        } catch (localErr) {
          setError("Error de almacenamiento local.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [])

  const captureLocation = () => {
    if (!navigator.geolocation) { setAppAlert({ isOpen: true, title: 'GPS Inactivo', message: 'Tu dispositivo no soporta GPS.', type: 'error' }); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setClientForm(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setIsLocating(false);
      },
      (error) => {
        setAppAlert({ isOpen: true, title: 'Permiso Denegado', message: 'No se pudo obtener la ubicación. Verifica los permisos de GPS.', type: 'error' });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalLatitude = clientForm.latitude !== '' ? parseFloat(clientForm.latitude) : null;
    const finalLongitude = clientForm.longitude !== '' ? parseFloat(clientForm.longitude) : null;
    const routeNameStr = (clientForm.route_name || "").trim();

    const routeExists = (routes || []).some(r => r?.name?.toLowerCase() === routeNameStr.toLowerCase());
    if (!routeExists && routeNameStr !== "") {
      const newRoute = { id: crypto.randomUUID(), name: routeNameStr };
      setRoutes(prev => [...(prev || []), newRoute].sort((a,b) => a.name.localeCompare(b.name)));
      db.routes.add(newRoute).catch(() => {});
    }

    const newClient = {
      ...clientForm,
      route_name: routeNameStr,
      latitude: finalLatitude,
      longitude: finalLongitude,
      id: crypto.randomUUID(),
      is_active: true
    };

    try {
      await axios.post(ENDPOINTS.clients, newClient);
      await db.clients.add(newClient);
      setClients(prev => [...(prev || []), newClient].sort((a, b) => a.location.localeCompare(b.location) || a.name.localeCompare(b.name)));
      setAppAlert({ isOpen: true, title: '¡Éxito!', message: 'Cliente registrado exitosamente.', type: 'success' });
    } catch (error) {
      try {
        await db.clients.add(newClient);
        await db.sync_clients_queue.add(newClient);
        setClients(prev => [...(prev || []), newClient].sort((a, b) => a.location.localeCompare(b.location) || a.name.localeCompare(b.name)));
        setAppAlert({ isOpen: true, title: 'Guardado Local', message: 'Modo sin conexión: El cliente se guardó en tu dispositivo.', type: 'warning' });
      } catch (dbError) {
        setAppAlert({ isOpen: true, title: 'Error Crítico', message: 'Error de almacenamiento local.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
      setIsAddingClient(false);
      setClientForm({ name: '', contact: '', phone_number: '', address: '', location: '', route_name: '', latitude: '', longitude: '' });
    }
  };

  const groupedProducts = products.reduce((acc, product) => { if (!acc[product.category]) acc[product.category] = []; acc[product.category].push(product); return acc; }, {});
  const categoryNames = Object.keys(groupedProducts).sort();

  const groupedClients = clients.reduce((acc, client) => { if (!acc[client.location]) acc[client.location] = []; acc[client.location].push(client); return acc; }, {});
  const locationNames = Object.keys(groupedClients).sort();

  const addToCart = (product) => setCart(prevCart => {
    const existing = prevCart.find(item => item.id === product.id);
    const requestedQty = existing ? existing.quantity + 1 : 1;
    
    let availableStock = 0;
    if (saleMode === 'mobile') {
      availableStock = mobileInventory.find(i => String(i.product_id) === String(product.id))?.stock_quantity || 0;
    } else {
      availableStock = centralInventory.find(i => String(i.product_id) === String(product.id))?.stock_quantity || 0;
    }

    if (requestedQty > availableStock) {
      setAppAlert({
        isOpen: true,
        title: 'Stock Agotado',
        message: `Solo tienes ${availableStock} unidades en ${saleMode === 'mobile' ? 'la Camioneta' : 'el Centro'}.`,
        type: 'error'
      });
      return prevCart; 
    }

    if (existing) return prevCart.map(item => item.id === product.id ? { ...item, quantity: requestedQty } : item);
    return [...prevCart, { ...product, quantity: 1 }];
  });

  const removeFromCart = (productId) => setCart(prevCart => {
    const existing = prevCart.find(item => item.id === productId);
    if (existing.quantity === 1) {
      const newCart = prevCart.filter(item => item.id !== productId);
      if (newCart.length === 0) setIsCartOpen(false);
      return newCart;
    }
    return prevCart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
  });

  const handleSetQuantity = (product, value) => {
    const q = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(q) || q < 0) return;
    setCart(prevCart => {
      if (q === 0) return prevCart.filter(item => item.id !== product.id);
      if (prevCart.find(item => item.id === product.id)) return prevCart.map(item => item.id === product.id ? { ...item, quantity: q } : item);
      return [...prevCart, { ...product, quantity: q }];
    });
  };

  const clearCart = () => { setCart([]); setIsCartOpen(false); };

  const openCategoryModal = (categoryName) => {
    const initialWeightsState = {};
    groupedProducts[categoryName].forEach(item => { initialWeightsState[item.weight_g || '0'] = true; });
    setExpandedWeights(initialWeightsState); setSelectedCategory(categoryName);
  };
  const toggleWeight = (weightKey) => setExpandedWeights(prev => ({ ...prev, [weightKey]: !prev[weightKey] }));
  const toggleLocation = (locationKey) => setExpandedLocations(prev => ({ ...prev, [locationKey]: !prev[locationKey] }));

  const totalOrder = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const sendWhatsAppTicket = (client, cart, totalAmount) => {
    if (!client || !client.phone_number) return; 

    let phone = client.phone_number.replace(/\D/g, '');
    if (phone.length === 10) phone = `52${phone}`; 

    let text = `*🌿 NAHUI NATURE - COMPROBANTE DE VENTA 🌿*\n\n`;
    text += `👤 *Cliente:* ${client.name}\n`;
    text += `📅 *Fecha:* ${new Date().toLocaleDateString()}\n\n`;
    text += `*🛍️️ DETALLE DEL PEDIDO:*\n`;
    
    cart.forEach(item => {
      const { cartTitle, cartSubtitle } = formatProduct(item);
      const nombreFinal = cartSubtitle ? `${cartTitle} ${cartSubtitle}` : cartTitle;
      const subtotalItem = item.price * item.quantity; 
      
      text += `▪️ ${item.quantity}x ${nombreFinal} - $${subtotalItem.toFixed(2)}\n`; 
    });

    text += `\n💰 *TOTAL: $${totalAmount.toFixed(2)}*\n\n`;
    text += `¡Gracias por tu preferencia! 🌱`;

    const encodedText = encodeURIComponent(text);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const url = isMobile ? `https://wa.me/${phone}?text=${encodedText}` : `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !activeClient) return;
    setIsSubmitting(true);
    const payload = {
      id: crypto.randomUUID(), client_id: activeClient.id, total_amount: totalOrder, created_at: new Date().toISOString(),
      sale_mode: saleMode,
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
          const currentSales = parseFloat(localStorage.getItem('shiftSales') || '0');
          const currentCount = parseInt(localStorage.getItem('shiftOrderCount') || '0');
          localStorage.setItem('shiftSales', (currentSales + totalOrder).toString());
          localStorage.setItem('shiftOrderCount', (currentCount + 1).toString());
        }
        updateLocalHistory(); 
        clearCart(); setActiveClient(null); 
      }
      fetchInventories();
    } catch (error) {
      try {
        await db.sync_queue.add(payload);
        if (sendWhatsApp) sendWhatsAppTicket(activeClient, cart, totalOrder);
        
        if (isOnRoad) {
          const currentSales = parseFloat(localStorage.getItem('shiftSales') || '0');
          const currentCount = parseInt(localStorage.getItem('shiftOrderCount') || '0');
          localStorage.setItem('shiftSales', (currentSales + totalOrder).toString());
          localStorage.setItem('shiftOrderCount', (currentCount + 1).toString());
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

        updateLocalHistory(); 
        clearCart(); 
        setActiveClient(null);
      } catch (dbError) { 
        setAppAlert({ isOpen: true, title: 'Error Crítico', message: 'Error de almacenamiento local al procesar la orden.', type: 'error' });
      }
    } finally { setIsSubmitting(false); }
  };

  const filteredOrders = ordersHistory.filter(order => {
    const term = searchOrder.toLowerCase();
    const matchSearch = (order.client_name || '').toLowerCase().includes(term) || 
                      (order.client_location || '').toLowerCase().includes(term) ||
                      (order.client_address || '').toLowerCase().includes(term);
                          
    let matchDate = true;
    if (filterDate) {
      const orderDate = new Date(order.created_at);
      const localDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
      matchDate = localDateStr === filterDate;
    }
    return matchSearch && matchDate;
  });
  
  const totalFilteredRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const isStoreView = !showInventory && !showOrders && activeClient;

  // Creamos esta constante para no duplicar código y que los botones se adapten
  const renderRouteButtons = () => (
    <>
      {isOfflineMode && (
        <div className="inline-flex bg-amber-100 text-amber-800 px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm items-center justify-center gap-1.5 border border-amber-300" title="Modo sin conexión">          
        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span></span>
          <span className="max-lg:landscape:hidden">Sin conexión</span>
        </div>
      )}
      {isOnRoad ? (
        <>
          <button onClick={() => setExpenseModal({ isOpen: true, concept: '', amount: '' })} className="bg-[#dd9d5c] hover:bg-[#b78049] text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
            <span className="max-lg:landscape:hidden">Gasto</span>
          </button>
          <button onClick={handleEndRoute} className="bg-[#d24343] hover:bg-[#bb2929] text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
            <span className="text-sm sm:text-base leading-none">🛑</span>
            <span className="max-lg:landscape:hidden">Terminar</span>
          </button>
        </>
      ) : (
        <button onClick={handleStartRoute} className="bg-brand-green hover:bg-brand-green-dark text-white font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 text-xs sm:text-sm uppercase tracking-wider">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 scale-x-[-1] translate-y-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>  
          <span className="max-lg:landscape:hidden">Iniciar Ruta</span>
        </button>
      )}
    </>
  );

  return (
      <div className="min-h-screen relative bg-brand-bg flex flex-col max-lg:landscape:pt-[60px]">
      
      <POSHeader 
        renderRouteButtons={renderRouteButtons}
        isStoreView={isStoreView}
        showOrders={showOrders}
        setShowOrders={setShowOrders}
        showInventory={showInventory}
        setShowInventory={setShowInventory}
      />
      
      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 relative max-lg:landscape:pl-[80px]">
        
          {/* --- GRID DE CONTENIDO PRINCIPAL --- */}
          <div className="p-3 sm:p-4 lg:p-10 pt-4 lg:pt-6 max-w-[1400px] mx-auto w-full pb-32 landscape:grid landscape:grid-cols-12 landscape:gap-6 landscape:items-start flex-1">
            
            <div className={`w-full space-y-4 ${isStoreView ? 'landscape:col-span-8' : 'landscape:col-span-12'}`}>
              {showInventory ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-brand-brown/10 pb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl md:text-3xl font-calistoga text-brand-brown">Control Logístico</h2>
                      <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider hidden md:inline-block">Gestión de Inventarios</span>
                    </div>
                    <button 
                      onClick={() => setShowRestockModal(true)}
                      className="bg-brand-brown hover:bg-brand-brown/90 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      Reabastecer Centro
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-brand-brown/10 shadow-sm overflow-hidden mb-6 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                      <div className="relative w-full md:w-96">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input 
                          type="text" 
                          placeholder="Buscar producto o variante..." 
                          value={searchInv}
                          onChange={(e) => setSearchInv(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-brand-green outline-none transition-colors text-sm font-medium text-brand-brown"
                        />
                      </div>
                    </div>

                    <div className="hidden lg:grid grid-cols-12 gap-2 p-4 border-b border-gray-100 font-black text-gray-400 text-[10px] xl:text-xs uppercase tracking-widest bg-white items-center">
                      <div className="col-span-4 pl-2">Catálogo</div>
                      <div className="col-span-4 grid grid-cols-3 text-center bg-gray-50 py-2 rounded-lg border border-gray-100 px-1">
                        <span className="flex items-center justify-center gap-1.5"><span className="text-lg">🏬</span> Central</span>
                        <span className="flex items-center justify-center gap-1.5 border-l border-r border-gray-200"><span className="text-lg">🚚</span> Movil</span>
                        <span className="flex items-center justify-center gap-1.5 text-brand-green"><span className="text-lg">📦</span> General</span>
                      </div>
                      <div className="col-span-4 text-right pr-2">Gestión Rápida</div>
                    </div>

                    <div className="divide-y divide-gray-100 bg-white">
                      {products
                        .filter(p => {
                          const term = searchInv.toLowerCase();
                          return p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
                        })
                        .map(product => {
                          const { cartTitle, cartSubtitle, catColor } = formatProduct(product);
                          const isSingle = product.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'unico';
                          const stockCasa = centralInventory.find(inv => String(inv.product_id) === String(product.id))?.stock_quantity || 0;
                          const stockCamioneta = mobileInventory.find(inv => String(inv.product_id) === String(product.id))?.stock_quantity || 0;
                          const stockTotal = stockCasa + stockCamioneta;
                          const inputValue = stockInputs[product.id] || '';
                          const weight = product.weight_g ? `${product.weight_g}g` : '';

                          return (
                            <div key={product.id} className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-4 items-center hover:bg-brand-bg/40 transition-colors">
                              <div className="col-span-1 lg:col-span-4 flex items-center gap-3 pl-1">
                                <div className="w-11 h-11 rounded-lg relative overflow-hidden flex items-center justify-center text-white flex-shrink-0 shadow-sm" style={{ backgroundColor: catColor }}>
                                  {product.image_url ? (
                                    <img src={product.image_url} alt={cartTitle} className="w-full h-full object-cover text-transparent" />
                                  ) : (
                                    <span className="font-black text-sm opacity-90">{product.category.substring(0,2).toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-brand-brown text-sm md:text-base leading-tight truncate">{cartTitle}</h4>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    {!isSingle && <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{cartSubtitle}</span>}
                                    {weight && <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded">{weight}</span>}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="col-span-1 lg:col-span-4 grid grid-cols-3 gap-1 text-center items-center bg-gray-50 lg:bg-transparent p-2 lg:p-0 rounded-xl border border-gray-100 lg:border-none mt-2 lg:mt-0">
                                <div className="flex flex-col">
                                  <span className="lg:hidden text-[9px] text-gray-400 uppercase font-bold mb-1">🏬 Central</span>
                                  <span className={`text-xl font-black ${stockCasa <= 10 ? 'text-red-500' : 'text-brand-brown'}`}>{stockCasa}</span>
                                </div>
                                <div className="flex flex-col border-l border-r border-gray-200">
                                  <span className="lg:hidden text-[9px] text-gray-400 uppercase font-bold mb-1">🚚 Movil</span>
                                  <span className="text-xl font-black text-blue-600">{stockCamioneta}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="lg:hidden text-[9px] text-brand-green uppercase font-bold mb-1">📦 General</span>
                                  <span className="text-xl font-black text-brand-green">{stockTotal}</span>
                                </div>
                              </div>
                              
                              <div className="col-span-1 lg:col-span-4 flex items-center justify-end gap-2 mt-3 lg:mt-0 pr-1">
                                <input 
                                  type="number" 
                                  min="1"
                                  placeholder="Cant."
                                  value={inputValue}
                                  onChange={(e) => setStockInputs(prev => ({...prev, [product.id]: e.target.value}))}
                                  className="w-16 sm:w-20 pl-1 pr-1 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green outline-none font-bold text-brand-brown transition-colors text-sm text-center shadow-sm" 
                                />
                                <button 
                                  title="Ingresar nueva mercancía al Centro"
                                  onClick={async () => {
                                    if(!inputValue || isNaN(inputValue) || Number(inputValue) <= 0) return;
                                    try {
                                      const res = await axios.post(`${ENDPOINTS.inventory}/add`, {
                                        product_id: product.id, quantity: Number(inputValue)
                                      });
                                      if (res.data.status === 'success') {
                                        setCentralInventory(prev => {
                                          const exists = prev.find(i => String(i.product_id) === String(product.id));
                                          if (exists) return prev.map(i => String(i.product_id) === String(product.id) ? { ...i, stock_quantity: res.data.new_stock } : i);
                                          return [...prev, { product_id: product.id, stock_quantity: res.data.new_stock }];
                                        });
                                        setStockInputs(prev => ({...prev, [product.id]: ''}));
                                        setAppAlert({ isOpen: true, title: 'Inventario Actualizado', message: 'La mercancía fue ingresada a la bodega central.', type: 'success' });
                                      }
                                    } catch (error) { setAppAlert({ isOpen: true, title: 'Error', message: 'No se pudo ingresar a bodega.', type: 'error' }); }
                                  }}
                                  className="bg-brand-green text-white font-bold px-3 py-2 rounded-lg hover:bg-brand-green-dark transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                  <span className="text-sm hidden xl:inline">Ingresar</span>
                                </button>
                                <button 
                                  title="Mover del Centro al Movil"
                                  onClick={() => {
                                    if (stockCasa === 0) {
                                      setAppAlert({ isOpen: true, title: 'Stock Insuficiente', message: 'No hay stock en el Centro para traspasar.', type: 'error' });
                                      return;
                                    }
                                    setTransferModal({
                                      isOpen: true,
                                      product: product,
                                      stockCasa: stockCasa,
                                      qty: ''
                                    });
                                  }}
                                  className="bg-[#49839a] text-white font-bold px-3 py-2 rounded-lg hover:bg-[#3a697c] transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
                                >
                                  <span className="text-sm hidden xl:inline">Traspasar</span>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
              ) : showOrders ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-4 mb-6 border-b border-brand-brown/10 pb-4">
                    <h2 className="text-2xl md:text-3xl font-calistoga text-brand-brown">Historial de Ventas</h2>
                  </div>
                  <div className="bg-white p-4 max-lg:landscape:p-2 rounded-2xl shadow-sm border border-brand-brown/10 mb-6 max-lg:landscape:mb-3 flex flex-col md:flex-row max-lg:landscape:flex-row gap-4 max-lg:landscape:gap-2 justify-between items-start md:items-center max-lg:landscape:items-center">
                    <div className="flex flex-col sm:flex-row max-lg:landscape:flex-row gap-3 max-lg:landscape:gap-2 w-full md:w-auto">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input type="text" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} placeholder="Buscar cliente o zona..." className="pl-10 pr-4 py-2 w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-green outline-none transition-colors text-sm font-medium" />
                      </div>
                      <div className="flex gap-2">
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-green outline-none transition-colors text-sm font-medium text-brand-brown" />
                        {filterDate && <button onClick={() => setFilterDate('')} className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors">X</button>}
                      </div>
                    </div>
                    
                    <div className="bg-brand-green/10 px-5 py-2.5 rounded-xl border border-brand-green/20 w-full md:w-auto flex justify-between md:flex-col md:items-end md:justify-center">
                      <p className="text-[10px] font-bold text-brand-green uppercase tracking-widest leading-none mb-1">Total Filtrado ({filteredOrders.length})</p>
                      <p className="text-2xl font-black text-brand-green leading-none">${totalFilteredRevenue.toFixed(2)}</p>
                    </div>
                  </div>

                  {isLoadingOrders ? (
                    <p className="text-brand-green font-bold text-lg animate-pulse">Consultando base de datos...</p>
                  ) : filteredOrders.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-brand-brown/10 text-center shadow-sm">
                      <p className="text-gray-500 font-bold">No se encontraron ventas con estos filtros.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-2xl border border-brand-green/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                          <div className="cursor-pointer group" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-md tracking-wide flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(order.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(order.created_at).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <div className="flex items-center gap-2">
                                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:text-brand-green ${expandedOrderId === order.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </div>
                            </div>
                            <h3 className="text-xl font-black text-brand-brown leading-tight mb-2">{order.client_name || "Cliente Desconocido"}</h3>
                            <div className="flex items-start gap-1.5">
                              <svg className="w-4 h-4 text-brand-brown/50 mt-[2px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <div>
                                <p className="text-sm font-bold text-gray-600 leading-none">{order.client_location || "Sin ubicación"}</p>
                                <p className="text-xs text-gray-500 font-medium mt-1 leading-tight pr-2">{order.client_address || "Sin dirección registrada"}</p>
                              </div>
                            </div>
                          </div>

                          {expandedOrderId === order.id && (
                            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2">
                              <p className="text-[10px] font-bold text-brand-green uppercase tracking-widest mb-3">Contenido del Pedido</p>
                              <ul className="space-y-2.5">
                                {order.items && order.items.map((item, idx) => {
                                  const isSingle = item.product_name && item.product_name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'unico';
                                  return (
                                    <li key={idx} className="flex justify-between items-start text-sm">
                                      <span className="text-brand-brown font-medium leading-tight flex-1 pr-4">
                                        <span className="font-black text-brand-green mr-1.5">{item.quantity}x</span> 
                                        {isSingle ? item.category : `${item.category} - ${item.product_name}`}
                                      </span>
                                      <span className="text-brand-brown font-bold tracking-tight">${Number(item.subtotal).toFixed(2)}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}

                          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Cobrado</span>
                            <span className="text-2xl font-black text-brand-green">${Number(order.total_amount).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {loading && <p className="text-brand-green font-bold text-lg animate-pulse">Cargando base de datos...</p>}
                  {error && <p className="text-red-500 font-bold text-lg">{error}</p>}

                  {!loading && !error && (
                    <>
                      {isAddingClient && !activeClient ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <div className="flex items-center gap-4 max-lg:landscape:gap-2 mb-6 max-lg:landscape:mb-3">
                            <button onClick={() => setIsAddingClient(false)} className="w-10 h-10 max-lg:landscape:w-8 max-lg:landscape:h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-brown hover:bg-gray-50 transition-colors">
                              <svg className="w-6 h-6 max-lg:landscape:w-4 max-lg:landscape:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <h2 className="text-2xl md:text-3xl max-lg:landscape:text-lg font-calistoga text-brand-brown">Alta de Cliente</h2>
                          </div>
                          <form onSubmit={handleCreateClient} className="bg-white rounded-2xl shadow-sm border border-brand-green/10 p-5 md:p-8 space-y-6">
                            <div>
                              <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">1. Identidad del Negocio</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-bold text-brand-brown mb-1">Nombre Comercial *</label>
                                  <input required type="text" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} placeholder="Ej. Abarrotes Doña Mary" className="w-full bg-brand-bg rounded-xl border border-brand-brown/10 p-3 outline-none focus:border-brand-green transition-colors" />
                                </div>
                                <div>
                                  <label className="block text-sm font-bold text-brand-brown mb-1">Nombre del Contacto</label>
                                  <input type="text" value={clientForm.contact} onChange={e => setClientForm({...clientForm, contact: e.target.value})} placeholder="Ej. María López" className="w-full bg-brand-bg rounded-xl border border-brand-brown/10 p-3 outline-none focus:border-brand-green transition-colors" />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-bold text-brand-brown mb-1">Teléfono (WhatsApp)</label>
                                  <input type="tel" value={clientForm.phone_number} onChange={e => setClientForm({...clientForm, phone_number: e.target.value})} placeholder="Ej. 312 123 4567" className="w-full bg-brand-bg rounded-xl border border-brand-brown/10 p-3 outline-none focus:border-brand-green transition-colors" />
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest border-b border-gray-100 pb-2 mb-4 mt-8">2. Logística y Ruteo</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-bold text-brand-brown mb-1">Comunidad / Colonia (Agrupador) *</label>
                                  <input required type="text" value={clientForm.location} onChange={e => setClientForm({...clientForm, location: e.target.value})} placeholder="Ej. Los Asmoles, Centro..." className="w-full bg-brand-bg rounded-xl border border-brand-brown/10 p-3 outline-none focus:border-brand-green transition-colors" />
                                </div>
                                <div>
                                  <label className="block text-sm font-bold text-brand-brown mb-1">Ruta Asignada *</label>
                                  <input 
                                    required 
                                    type="text" 
                                    list="rutas-registradas"
                                    value={clientForm.route_name} 
                                    onChange={e => setClientForm({...clientForm, route_name: e.target.value})} 
                                    placeholder="Escribe o selecciona una ruta..." 
                                    className="w-full bg-brand-bg rounded-xl border border-brand-brown/10 p-3 outline-none focus:border-brand-green transition-colors text-brand-brown"
                                  />
                                  <datalist id="rutas-registradas">
                                    {(routes || []).map(ruta => (
                                      <option key={ruta.id} value={ruta.name} />
                                    ))}
                                  </datalist>
                                  <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Selecciona una existente o teclea una nueva.</p>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-bold text-brand-brown mb-1">Dirección (Calle, Número o Referencia) *</label>
                                  <textarea required value={clientForm.address} onChange={e => setClientForm({...clientForm, address: e.target.value})} rows="2" placeholder="Ej. Av. Niños Héroes #123, o Referencia" className="w-full bg-brand-bg rounded-xl border border-brand-brown/10 p-3 outline-none focus:border-brand-green transition-colors resize-none"></textarea>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest border-b border-gray-100 pb-2 mb-4 mt-8">3. Coordenadas Exactas</h3>
                              <div className="flex flex-col items-start gap-4">
                                <button type="button" onClick={captureLocation} disabled={isLocating} className={`flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm ${clientForm.latitude !== '' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white'}`}>
                                  {isLocating ? (
                                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  ) : clientForm.latitude !== '' ? (
                                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                  ) : (
                                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  )}
                                  {isLocating ? 'Obteniendo satélites...' : clientForm.latitude !== '' ? 'Ubicación Capturada (Puedes editarla abajo)' : 'Capturar Ubicación (En la calle)'}
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Latitud (Manual / Google Maps)</label>
                                    <input type="number" step="any" value={clientForm.latitude} onChange={e => setClientForm({...clientForm, latitude: e.target.value})} placeholder="Ej. 19.2433" className="w-full bg-white rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-brand-green font-mono" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Longitud (Manual / Google Maps)</label>
                                    <input type="number" step="any" value={clientForm.longitude} onChange={e => setClientForm({...clientForm, longitude: e.target.value})} placeholder="Ej. -103.7251" className="w-full bg-white rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-brand-green font-mono" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="pt-6 border-t border-brand-brown/10">
                              <button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-white font-black text-lg py-4 rounded-xl hover:bg-brand-green-dark transition-colors shadow-lg active:scale-[0.99] uppercase tracking-wider">
                                {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                              </button>
                            </div>
                          </form>
                        </div>

                      ) : !activeClient ? (
                        <div className="animate-in fade-in duration-300">
                          <div className="mb-6 max-lg:landscape:mb-3 flex flex-col sm:flex-row max-lg:landscape:flex-row sm:items-center justify-between gap-4 max-lg:landscape:gap-2">
                            <div className="flex items-center gap-3">
                              <h2 className="text-2xl max-lg:landscape:text-lg font-calistoga text-brand-brown">Directorio</h2>
                              <span className="bg-brand-brown/10 text-brand-brown px-3 py-1 max-lg:landscape:px-2 max-lg:landscape:py-0.5 rounded-full text-xs max-lg:landscape:text-[10px] font-bold uppercase tracking-wider">{clients.length} tiendas</span>
                            </div>
                            <button onClick={() => setIsAddingClient(true)} className="bg-white border-2 border-brand-green text-brand-green font-bold px-5 py-2.5 max-lg:landscape:px-3 max-lg:landscape:py-1.5 rounded-xl max-lg:landscape:rounded-lg hover:bg-brand-green hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 max-lg:landscape:text-xs">
                              <svg className="w-5 h-5 max-lg:landscape:w-4 max-lg:landscape:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                              Nuevo Cliente
                            </button>
                          </div>
                          
                          <div className="space-y-4 max-lg:landscape:space-y-0 max-lg:landscape:grid max-lg:landscape:grid-cols-2 max-lg:landscape:gap-3">
                            {locationNames.map(locationName => {
                              const localClients = groupedClients[locationName];
                              const isExpanded = expandedLocations[locationName];
                              return (
                                <div key={locationName} className={`bg-white rounded-2xl max-lg:landscape:rounded-xl shadow-sm border border-brand-green/10 overflow-hidden transition-all ${isExpanded ? 'max-lg:landscape:col-span-2' : ''}`}>
                                  <button onClick={() => toggleLocation(locationName)} className="w-full p-5 max-lg:landscape:p-3 flex justify-between items-center hover:bg-brand-bg transition-colors">
                                    <div className="flex items-center gap-3 max-lg:landscape:gap-2">
                                      <div className="w-10 h-10 max-lg:landscape:w-8 max-lg:landscape:h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green"><svg className="w-5 h-5 max-lg:landscape:w-4 max-lg:landscape:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                                      <div className="text-left"><h3 className="text-xl max-lg:landscape:text-base font-bold text-brand-brown leading-tight">{locationName}</h3><p className="text-sm max-lg:landscape:text-[10px] text-gray-500 font-medium">{localClients.length} tiendas</p></div>
                                    </div>
                                    <svg className={`w-6 h-6 max-lg:landscape:w-5 max-lg:landscape:h-5 text-brand-brown transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                  </button>
                                  {isExpanded && (
                                    <div className="border-t border-gray-100 bg-brand-bg/30 max-lg:landscape:grid max-lg:landscape:grid-cols-2 max-lg:landscape:gap-2 max-lg:landscape:p-2">
                                      {localClients.map(client => (
                                        <div key={client.id} className="p-4 max-lg:landscape:p-3 border-b max-lg:landscape:border border-gray-100 max-lg:landscape:rounded-xl max-lg:landscape:bg-white last:border-0 max-lg:landscape:last:border flex flex-col sm:flex-row sm:items-center max-lg:landscape:flex-col max-lg:landscape:items-stretch justify-between gap-4 max-lg:landscape:gap-3 hover:bg-white transition-colors shadow-sm max-lg:landscape:shadow-none">
                                          <div>
                                            <h4 className="text-lg max-lg:landscape:text-sm font-black text-brand-green leading-tight">{client.name}</h4>
                                            <p className="text-sm max-lg:landscape:text-[10px] text-brand-brown font-medium mt-0.5 flex items-start gap-1.5"><svg className="w-4 h-4 max-lg:landscape:w-3 max-lg:landscape:h-3 text-brand-brown/50 mt-[2px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{client.address || "Sin referencia"}</p>
                                            <div className="flex flex-col max-lg:landscape:flex-row max-lg:landscape:flex-wrap gap-2 mt-2 max-lg:landscape:mt-1.5">
                                              {client.contact && <p className="text-xs max-lg:landscape:text-[9px] text-gray-500 flex items-center gap-1.5 font-medium"><svg className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{client.contact}</p>}
                                              {client.phone_number && (() => {
                                                const cleanPhone = client.phone_number.replace(/\D/g, '');
                                                const waLink = cleanPhone.length === 10 ? `https://wa.me/52${cleanPhone}` : `https://wa.me/${cleanPhone}`;
                                                return (
                                                  <div className="flex items-center gap-2">
                                                    <a href={`tel:${cleanPhone}`} className="flex items-center gap-1.5 text-xs max-lg:landscape:text-[9px] font-bold text-brand-green hover:bg-brand-green hover:text-white transition-colors bg-brand-green/10 px-2.5 py-1.5 max-lg:landscape:px-2 max-lg:landscape:py-1 rounded-lg max-lg:landscape:rounded-md"><svg className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>Llamar</a>
                                                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs max-lg:landscape:text-[9px] font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 max-lg:landscape:px-2 max-lg:landscape:py-1 rounded-lg max-lg:landscape:rounded-md shadow-sm"><svg className="w-3.5 h-3.5 max-lg:landscape:w-3 max-lg:landscape:h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>WhatsApp</a>
                                                  </div>
                                                );
                                              })()}
                                            </div>
                                          </div>
                                          <button onClick={() => setActiveClient(client)} className="bg-brand-green text-white font-bold px-6 py-2.5 max-lg:landscape:px-3 max-lg:landscape:py-2 rounded-xl max-lg:landscape:rounded-lg hover:bg-brand-green-dark transition-all active:scale-95 whitespace-nowrap shadow-sm max-lg:landscape:text-xs">Iniciar Venta</button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                          
                          {/* TARJETA DEL CLIENTE CORREGIDA (RESPETA TAMAÑO DE ESCRITORIO) */}
                          <div className="bg-brand-brown text-white p-4 lg:p-6 max-lg:landscape:p-3 rounded-2xl max-lg:landscape:rounded-xl mb-6 max-lg:landscape:mb-3 shadow-md flex flex-col lg:flex-row max-lg:landscape:flex-row justify-between items-start lg:items-center max-lg:landscape:items-center gap-4 max-lg:landscape:gap-3">
                            
                            <div className="flex flex-col lg:flex-row max-lg:landscape:flex-row lg:items-center max-lg:landscape:items-center gap-2 lg:gap-4 max-lg:landscape:gap-4 flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="hidden lg:inline max-lg:landscape:inline text-xl leading-none opacity-80 flex-shrink-0">👤</span>
                                <p className="lg:hidden max-lg:landscape:hidden text-brand-bg text-xs uppercase tracking-widest font-bold mb-1">Vendiendo a:</p>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl max-lg:landscape:text-lg font-black font-calistoga truncate leading-tight tracking-wide">{activeClient.name}</h2>
                              </div>
                              
                              {/* Mini Toggle Modalidad */}
                              <div className="flex items-center bg-black/20 p-1.5 max-lg:landscape:p-1 rounded-xl max-lg:landscape:rounded-lg border border-white/10 w-fit flex-shrink-0">
                                <button 
                                  onClick={() => setSaleMode('mobile')} 
                                  className={`px-3 py-1.5 max-lg:landscape:px-2.5 max-lg:landscape:py-1 rounded-lg max-lg:landscape:rounded-md text-xs lg:text-sm max-lg:landscape:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${saleMode === 'mobile' ? 'bg-[#49839a] text-white shadow-md' : 'text-white/50 hover:text-white'}`}
                                >
                                  <svg className="w-4 h-4 max-lg:landscape:w-3.5 max-lg:landscape:h-3.5 scale-x-[-1] translate-y-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                  </svg>
                                  <span>En Ruta</span>
                                </button>
                                <button 
                                  onClick={() => setSaleMode('central')} 
                                  className={`px-3 py-1.5 max-lg:landscape:px-2.5 max-lg:landscape:py-1 rounded-lg max-lg:landscape:rounded-md text-xs lg:text-sm max-lg:landscape:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${saleMode === 'central' ? 'bg-[#67924a] text-white shadow-md' : 'text-white/50 hover:text-white'}`}
                                >
                                  <svg className="w-4 h-4 max-lg:landscape:w-3.5 max-lg:landscape:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>En Centro</span>
                                </button>
                              </div>
                            </div>

                            {/* Derecha: Botón Cambiar */}
                            <button onClick={() => { if(cart.length > 0) { if(confirm("Tienes productos en el carrito. ¿Deseas descartarlos y cambiar de cliente?")) { clearCart(); setActiveClient(null); } } else { setActiveClient(null); } }} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs lg:text-sm max-lg:landscape:text-[10px] uppercase tracking-wider font-bold py-2.5 px-4 lg:py-2 lg:px-4 max-lg:landscape:py-1.5 max-lg:landscape:px-3 rounded-xl max-lg:landscape:rounded-lg transition-all whitespace-nowrap flex-shrink-0 text-center self-start lg:self-center max-lg:landscape:self-center">
                              Cambiar Cliente
                            </button>
                          </div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-lg:landscape:grid-cols-3 max-lg:landscape:gap-3">
                            {categoryNames.map(categoryName => {
                              const items = groupedProducts[categoryName];
                              const { catColor } = formatProduct(items[0]);
                              const coverImage = CATEGORY_COVERS[categoryName];
                              const itemsInCartForCategory = items.reduce((acc, item) => acc + (cart.find(c => c.id === item.id)?.quantity || 0), 0);
                              return (
                                <div key={categoryName} onClick={() => openCategoryModal(categoryName)} className="bg-white rounded-2xl max-lg:landscape:rounded-xl shadow-sm border border-brand-green/10 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative flex flex-col h-full">
                                  <div className="h-1.5 max-lg:landscape:h-1 w-full" style={{ backgroundColor: catColor }}></div>
                                  <div className="aspect-[4/3] max-lg:landscape:aspect-[16/9] relative overflow-hidden bg-brand-bg flex items-center justify-center">
                                    {coverImage ? <img src={coverImage} alt={categoryName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 text-transparent" /> : <span className="text-5xl max-lg:landscape:text-2xl font-black text-brand-brown/20 uppercase tracking-widest">{categoryName.substring(0,3)}</span>}
                                    {itemsInCartForCategory > 0 && <div className="absolute top-3 right-3 max-lg:landscape:top-1.5 max-lg:landscape:right-1.5 bg-brand-green text-white w-8 h-8 max-lg:landscape:w-5 max-lg:landscape:h-5 max-lg:landscape:text-[10px] flex items-center justify-center rounded-full font-bold shadow-lg border-2 max-lg:landscape:border border-white">{itemsInCartForCategory}</div>}
                                  </div>
                                  <div className="p-5 max-lg:landscape:p-2 flex-1 flex flex-col justify-center text-center">
                                    <h2 className="text-2xl max-lg:landscape:text-sm font-bold text-brand-brown leading-tight">{categoryName}</h2>
                                    <p className="text-sm max-lg:landscape:text-[9px] text-gray-500 mt-2 max-lg:landscape:mt-0.5 font-medium">{items.length} variants disponibles</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

      <CartSidebar 
        cart={cart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        isStoreView={isStoreView}
        totalItems={totalItems}
        totalOrder={totalOrder}
        sendWhatsApp={sendWhatsApp}
        setSendWhatsApp={setSendWhatsApp}
        isSubmitting={isSubmitting}
        activeClient={activeClient}
        removeFromCart={removeFromCart}
        handleSetQuantity={handleSetQuantity}
        addToCart={addToCart}
        clearCart={clearCart}
        formatProduct={formatProduct}
        handleCheckout={handleCheckout}
      />
      
      <ExpenseModal expenseModal={expenseModal} setExpenseModal={setExpenseModal} handleAddExpense={handleAddExpense} />
      <AppAlertModal appAlert={appAlert} onClose={() => setAppAlert({ ...appAlert, isOpen: false })} />

      <ShiftReportModal 
        showShiftReport={showShiftReport} 
        setShowShiftReport={setShowShiftReport} 
        shiftStats={shiftStats} 
        expenses={expenses} 
        mobileInventory={mobileInventory} 
        products={products} 
        confirmEndRoute={confirmEndRoute} 
      />

      <RouteLoadModal 
        showRouteLoadModal={showRouteLoadModal} 
        setShowRouteLoadModal={setShowRouteLoadModal} 
        products={products} 
        formatProduct={formatProduct} 
        centralInventory={centralInventory} 
        routeLoadCart={routeLoadCart} 
        setRouteLoadCart={setRouteLoadCart} 
        handleBulkRouteLoad={handleBulkRouteLoad} 
        isSubmitting={isSubmitting} 
      />

      <TransferModal 
        transferModal={transferModal} 
        setTransferModal={setTransferModal} 
        formatProduct={formatProduct} 
        setCentralInventory={setCentralInventory} 
        setMobileInventory={setMobileInventory} 
        setAppAlert={setAppAlert} 
        ENDPOINTS={ENDPOINTS} 
      />

      <RestockModal 
        showRestockModal={showRestockModal} 
        setShowRestockModal={setShowRestockModal} 
        SUPPLIERS={SUPPLIERS} 
        products={products} 
        formatProduct={formatProduct} 
        centralInventory={centralInventory} 
        restockCart={restockCart} 
        setRestockCart={setRestockCart} 
        handleBulkRestock={handleBulkRestock} 
        isSubmitting={isSubmitting} 
      />

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCategory(null)}></div>
          <div className="bg-brand-bg w-full max-w-5xl max-h-[95vh] rounded-2xl sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-white p-4 sm:p-6 max-lg:landscape:py-3 max-lg:landscape:px-6 border-b border-brand-brown/10 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
              <div><h2 className="text-2xl sm:text-3xl max-lg:landscape:text-2xl font-calistoga text-brand-brown leading-none">{selectedCategory}</h2><p className="text-brand-green font-bold text-xs sm:text-sm max-lg:landscape:text-xs tracking-widest uppercase mt-1">Selecciona por gramaje</p></div>
              <button onClick={() => setSelectedCategory(null)} className="bg-brand-bg text-brand-brown hover:bg-red-100 hover:text-red-500 w-10 h-10 max-lg:landscape:w-8 max-lg:landscape:h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"><svg className="w-6 h-6 max-lg:landscape:w-5 max-lg:landscape:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="p-2 sm:p-6 max-lg:landscape:p-4 overflow-y-auto flex-1">
              {Object.keys(groupedProducts[selectedCategory].reduce((acc, item) => { const w = item.weight_g || '0'; if (!acc[w]) acc[w] = []; acc[w].push(item); return acc; }, {})).sort((a,b) => Number(a) - Number(b)).map(weight => {
                const subItems = groupedProducts[selectedCategory].filter(i => (i.weight_g || '0') == weight); const isExpanded = expandedWeights[weight];                return (
                  <div key={weight} className="mb-4 max-lg:landscape:mb-3 bg-white rounded-xl shadow-sm border border-brand-brown/5 overflow-hidden">
                    <button onClick={() => toggleWeight(weight)} className="w-full bg-brand-brown/5 p-4 max-lg:landscape:p-3 flex justify-between items-center hover:bg-brand-brown/10 transition-colors"><span className="font-bold text-brand-brown text-lg max-lg:landscape:text-base">Presentación {weight}g <span className="text-brand-green text-sm max-lg:landscape:text-xs ml-2">({subItems.length} sabores)</span></span><svg className={`w-5 h-5 text-brand-brown transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
                    {isExpanded && (
                      <div className="grid grid-cols-1 max-lg:landscape:grid-cols-2 gap-0 max-lg:landscape:gap-2 p-0 max-lg:landscape:p-2 bg-gray-50/50">
                        {subItems.map(product => {
                          const quantity = cart.find(item => item.id === product.id)?.quantity || 0; const { badge, catColor } = formatProduct(product);
                          return (
                            <div key={product.id} className="p-3 sm:p-4 max-lg:landscape:p-2 border-b max-lg:landscape:border border-gray-100 max-lg:landscape:rounded-xl max-lg:landscape:bg-white flex flex-row items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors shadow-sm">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 max-lg:landscape:w-12 max-lg:landscape:h-12 rounded-lg relative flex-shrink-0 bg-brand-bg overflow-hidden flex items-center justify-center shadow-sm">
                                {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover text-transparent" /> : <div className="w-full h-full flex items-center justify-center text-white" style={{ backgroundColor: catColor }}><span className="font-black text-2xl max-lg:landscape:text-lg opacity-70 tracking-tighter">{product.name.substring(0,2).toUpperCase()}</span></div>}
                              </div>
                              <div className="flex-1 flex flex-col justify-center min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">{badge ? <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 py-0.5 max-lg:landscape:px-1.5 rounded shadow-sm whitespace-nowrap ${badge.colorClass}`}>{badge.text}</span> : <span className="text-xs font-bold text-brand-brown">ÚNICO</span>}</div>
                                <span className="text-lg sm:text-xl max-lg:landscape:text-base font-black text-brand-green leading-none truncate">${product.price}</span>
                              </div>
                              <div className="w-[110px] sm:w-[130px] max-lg:landscape:w-[100px] flex-shrink-0">
                                {quantity > 0 ? (
                                  <div className="flex items-center justify-between bg-white rounded-xl overflow-hidden border border-brand-green/40 h-[40px] sm:h-[44px] max-lg:landscape:h-[36px] shadow-sm"><button onClick={() => removeFromCart(product.id)} className="w-8 sm:w-10 max-lg:landscape:w-8 h-full flex items-center justify-center text-brand-green hover:bg-brand-green hover:text-white transition-colors text-xl font-bold">-</button><input type="number" value={quantity} onChange={(e) => handleSetQuantity(product, e.target.value)} className="w-full text-center font-bold text-brand-brown text-base sm:text-lg max-lg:landscape:text-sm bg-transparent outline-none appearance-none m-0" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} /><button onClick={() => addToCart(product)} className="w-8 sm:w-10 max-lg:landscape:w-8 h-full flex items-center justify-center text-brand-green hover:bg-brand-green hover:text-white transition-colors text-xl font-bold">+</button></div>
                                ) : (
                                  <button onClick={() => addToCart(product)} className="w-full h-[40px] sm:h-[44px] max-lg:landscape:h-[36px] bg-white border-2 border-brand-green text-brand-green font-bold rounded-xl hover:bg-brand-green hover:text-white active:scale-[0.98] transition-all text-xs sm:text-sm uppercase tracking-wider shadow-sm">Agregar</button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            <div className="bg-white border-t border-brand-brown/10 p-3 sm:p-4 max-lg:landscape:py-2 flex justify-center flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={() => setSelectedCategory(null)} className="w-full sm:w-auto bg-brand-brown text-white font-bold py-3 px-8 max-lg:landscape:py-2 rounded-xl hover:bg-brand-brown/90 transition-colors uppercase tracking-wider text-sm max-lg:landscape:text-xs shadow-md active:scale-95">Volver a Categorías</button>
            </div>
            
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <button onClick={() => setIsCartOpen(true)} className={`fixed bottom-8 right-8 z-40 bg-brand-green hover:bg-brand-green-dark text-white p-4 rounded-full shadow-[0_10px_25px_rgba(91,138,60,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${isStoreView ? 'max-lg:landscape:hidden' : ''}`}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <div className="bg-white text-brand-green font-black rounded-full h-7 w-7 flex items-center justify-center text-sm border-2 border-white">{totalItems}</div>
        </button>
      )}

      {isCartOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsCartOpen(false)} />}

      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-brand-bg shadow-2xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col border-l border-brand-brown/10 ${isStoreView ? 'max-lg:landscape:hidden' : ''}`}>
        <div className="p-6 border-b border-brand-brown/10 flex justify-between items-start bg-white">
          <div>
            <h2 className="text-2xl font-calistoga text-brand-brown flex items-center gap-3">Orden Actual <span className="bg-brand-green text-white font-sans text-xs py-1 px-3 rounded-full font-bold">{totalItems} items</span></h2>
            <button onClick={clearCart} className="text-sm leading-none text-red-500 hover:text-red-700 font-bold mt-3 flex items-center gap-1.5 transition-colors"><svg className="w-4 h-4 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Vaciar carrito</button>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-brand-brown hover:bg-brand-bg rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-brand-bg">
          <ul className="space-y-4">
            {cart.map(item => {
              const { cartTitle, cartSubtitle, cartSubtitleColor, catColor } = formatProduct(item)
              return (
                <li key={item.id} className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-brand-brown/5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: catColor }}></div>
                  <div className="flex-1 pl-3 pr-2 min-w-0">
                    <p className="font-bold text-brand-brown text-sm leading-tight mb-1 truncate">{cartTitle}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {cartSubtitle && <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap ${cartSubtitleColor}`}>{cartSubtitle}</span>}
                      <p className="text-xs text-brand-green font-bold">${item.price} c/u</p>
                    </div>
                  </div>
                  <div className="flex items-center w-[90px] sm:w-[100px] justify-between bg-brand-bg rounded-lg border border-brand-brown/10 h-8 overflow-hidden flex-shrink-0">
                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-full bg-white hover:text-red-500 font-bold">-</button>
                    <input type="number" value={item.quantity} onChange={(e) => handleSetQuantity(item, e.target.value)} className="w-full text-center font-black text-xs sm:text-sm text-brand-brown bg-transparent outline-none appearance-none m-0" style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
                    <button onClick={() => addToCart(item)} className="w-8 h-full bg-white hover:text-brand-green font-bold">+</button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="p-6 border-t border-brand-brown/10 bg-white">
          <div className="flex justify-between items-end mb-4">
            <span className="text-lg font-bold text-brand-brown uppercase tracking-widest font-calistoga">Total</span>
            <span className="text-4xl font-black text-brand-green tracking-tighter">${totalOrder.toFixed(2)}</span>
          </div>

          <label className="flex items-center justify-between mb-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-colors shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <span className="text-[10px] font-bold text-emerald-800">WhatsApp</span>
            </div>
            <input 
              type="checkbox" 
              checked={sendWhatsApp} 
              onChange={() => {
                const newVal = !sendWhatsApp;
                setSendWhatsApp(newVal);
                localStorage.setItem('sendWhatsApp', newVal);
              }} 
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" 
            />
          </label>

          <button onClick={handleCheckout} disabled={isSubmitting || cart.length === 0 || !activeClient} className={`w-full text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg uppercase tracking-wide flex justify-center items-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green-dark shadow-brand-green/30 active:scale-[0.98]'}`}>
          {isSubmitting ? 'Procesando...' : 'Cobrar Orden'}
          </button>
        </div>
      </div>
    </div>
  </div> 
</div> 
);
}

export default App;
