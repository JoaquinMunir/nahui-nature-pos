import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { db } from '../db'; // Ajusta la ruta si db.js está en otro nivel

export function useInventory({ ENDPOINTS, setAppAlert, setIsSubmitting }) {
  // Estados de inventario y logística
  const [searchInv, setSearchInv] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [centralInventory, setCentralInventory] = useState([]);
  const [mobileInventory, setMobileInventory] = useState([]);
  const [showRouteLoadModal, setShowRouteLoadModal] = useState(false);
  const [routeLoadCart, setRouteLoadCart] = useState({});
  const [stockInputs, setStockInputs] = useState({});
  const [transferModal, setTransferModal] = useState({ isOpen: false, product: null, stockCasa: 0, qty: '' });
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockCart, setRestockCart] = useState({}); 

  // Descarga y sincronización local
  const fetchInventories = useCallback(async () => {
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
    } catch {
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
  }, [ENDPOINTS.inventory, ENDPOINTS.mobileInventory]);

  useEffect(() => {
    // Carga inicial: los setState ocurren después del await, no durante el efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventories();
  }, [fetchInventories]);

    // Ingreso individual de mercancía a Bodega Central
  const handleAddCentralStock = async (productId) => {
    const quantity = Number(stockInputs[productId]);
    if (!quantity || quantity <= 0) return;

    try {
      const res = await axios.post(`${ENDPOINTS.inventory}/add`, { product_id: productId, quantity });
      if (res.data.status === 'success') {
        setCentralInventory(prev => {
          const exists = prev.find(i => String(i.product_id) === String(productId));
          if (exists) return prev.map(i => String(i.product_id) === String(productId) ? { ...i, stock_quantity: res.data.new_stock } : i);
          return [...prev, { product_id: productId, stock_quantity: res.data.new_stock }];
        });
        setStockInputs(prev => ({ ...prev, [productId]: '' }));
        setAppAlert({ isOpen: true, title: 'Actualizado', message: 'Ingresado a central.', type: 'success' });
      }
    } catch {
      setAppAlert({ isOpen: true, title: 'Error', message: 'No se pudo ingresar.', type: 'error' });
    }
  };

  // Traspaso individual de Bodega Central a la unidad móvil
  const handleTransferToMobile = async (e) => {
    e.preventDefault();
    const qty = parseInt(transferModal.qty, 10);
    if (isNaN(qty) || qty <= 0) return alert('Ingresa un número válido.');
    if (qty > transferModal.stockCasa) return alert(`❌ No puedes traspasar ${qty}. Solo hay ${transferModal.stockCasa}.`);

    const productId = transferModal.product.id;
    try {
      const res = await axios.post(ENDPOINTS.transfer, { product_id: productId, quantity: qty, route_name: 'Ruta 1' });
      if (res.data.status === 'success') {
        setCentralInventory(prev => prev.map(i =>
          String(i.product_id) === String(productId) ? { ...i, stock_quantity: res.data.new_central_stock } : i
        ));
        setMobileInventory(prev => {
          const exists = prev.find(i => String(i.product_id) === String(productId));
          if (exists) return prev.map(i => String(i.product_id) === String(productId) ? { ...i, stock_quantity: res.data.new_mobile_stock } : i);
          return [...prev, { product_id: productId, stock_quantity: res.data.new_mobile_stock }];
        });
        setTransferModal({ isOpen: false, product: null, stockCasa: 0, qty: '' });
      }
    } catch {
      setAppAlert({ isOpen: true, title: 'Error', message: 'Error de conexión al intentar el traspaso.', type: 'error' });
    }
  };

  // Lógica de Reabastecimiento Central
  const handleBulkRestock = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const itemsToUpdate = Object.entries(restockCart).filter(([, qty]) => qty > 0);
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
    } catch {
      setAppAlert({ isOpen: true, title: 'Error', message: 'Error al conectar con la base de datos para el reabastecimiento.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica de Carga a Camioneta
  const handleBulkRouteLoad = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const itemsToTransfer = Object.entries(routeLoadCart).filter(([, qty]) => qty > 0);
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
    } catch {
      setAppAlert({ isOpen: true, title: 'Error', message: 'Hubo un problema al cargar la camioneta.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    searchInv, setSearchInv,
    showInventory, setShowInventory,
    centralInventory, setCentralInventory,
    mobileInventory, setMobileInventory,
    showRouteLoadModal, setShowRouteLoadModal,
    routeLoadCart, setRouteLoadCart,
    stockInputs, setStockInputs,
    transferModal, setTransferModal,
    showRestockModal, setShowRestockModal,
    restockCart, setRestockCart,
    fetchInventories,
    handleBulkRestock,
    handleBulkRouteLoad,
    handleAddCentralStock,
    handleTransferToMobile
  };
}