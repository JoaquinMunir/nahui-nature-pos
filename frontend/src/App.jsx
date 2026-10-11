import { useState } from 'react';

import { ENDPOINTS, CATEGORY_COVERS, formatProduct, SUPPLIERS } from './utils/constants';

import AppAlertModal from './components/modals/AppAlertModal';
import ExpenseModal from './components/modals/ExpenseModal';
import ShiftReportModal from './components/modals/ShiftReportModal';
import RouteLoadModal from './components/modals/RouteLoadModal';
import TransferModal from './components/modals/TransferModal';
import RestockModal from './components/modals/RestockModal';

import POSHeader from './components/pos/POSHeader';
import CartSidebar from './components/pos/CartSidebar';
import ClientDirectory from './components/pos/ClientDirectory';
import CategoryModal from './components/pos/CategoryModal';
import SalesHistoryPanel from './components/pos/SalesHistoryPanel';
import InventoryPanel from './components/pos/InventoryPanel';
import AddClientForm from './components/pos/AddClientForm';
import StoreGrid from './components/pos/StoreGrid';

import { usePOSData } from './hooks/usePOSData';
import { useCart } from './hooks/useCart';
import { useInventory } from './hooks/useInventory';
import { useRouteSession } from './hooks/useRouteSession';
import { useClients } from './hooks/useClients';

function App() {
  // 1. Estado de UI local
  const [appAlert, setAppAlert] = useState({ isOpen: false, title: '', message: '', type: 'error' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchOrder, setSearchOrder] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [saleMode, setSaleMode] = useState(() => (localStorage.getItem('isOnRoad') === 'true' ? 'mobile' : 'central'));
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedWeights, setExpandedWeights] = useState({});
  const [expandedLocations, setExpandedLocations] = useState({});

  // 2. Inventario central y móvil
  const {
    searchInv, setSearchInv, showInventory, setShowInventory,
    centralInventory, setCentralInventory, mobileInventory, setMobileInventory,
    showRouteLoadModal, setShowRouteLoadModal, routeLoadCart, setRouteLoadCart,
    stockInputs, setStockInputs, transferModal, setTransferModal,
    showRestockModal, setShowRestockModal, restockCart, setRestockCart,
    fetchInventories, handleBulkRestock, handleBulkRouteLoad,
  } = useInventory({ ENDPOINTS, setAppAlert, setIsSubmitting });

  // 3. Carrito
  const {
    cart, isCartOpen, setIsCartOpen, addToCart, removeFromCart,
    handleSetQuantity, clearCart, totalOrder, totalItems,
  } = useCart({ saleMode, mobileInventory, centralInventory, setAppAlert });

  // 4. Sesión de ruta
  const {
    showShiftReport, setShowShiftReport, shiftStats, isOnRoad, expenses,
    expenseModal, setExpenseModal, handleStartRoute, handleAddExpense,
    handleEndRoute, confirmEndRoute,
  } = useRouteSession({ ENDPOINTS, setAppAlert, setShowInventory, setShowOrders, setShowRouteLoadModal, setSaleMode });

  // 5. Datos maestros, sincronización y cobro
  const {
    products, clients, setClients, routes, setRoutes, loading, error,
    isOfflineMode, ordersHistory, activeClient, setActiveClient,
    sendWhatsApp, setSendWhatsApp, handleCheckout,
  } = usePOSData({ ENDPOINTS, setAppAlert, fetchInventories, saleMode, setMobileInventory, setCentralInventory, isOnRoad, clearCart, setIsSubmitting });

  // 6. Alta de clientes
  const {
    isAddingClient, setIsAddingClient, isLocating, clientForm,
    setClientForm, captureLocation, handleCreateClient,
  } = useClients({ ENDPOINTS, setAppAlert, routes, setRoutes, setClients, setIsSubmitting });

  // 7. VARIABLES DERIVADAS
  const filteredOrders = ordersHistory.filter(order => {
    const term = searchOrder.toLowerCase();
    const matchSearch = (order.client_name || '').toLowerCase().includes(term) || (order.client_location || '').toLowerCase().includes(term) || (order.client_address || '').toLowerCase().includes(term);
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

  const groupedProducts = products.reduce((acc, product) => { if (!acc[product.category]) acc[product.category] = []; acc[product.category].push(product); return acc; }, {});
  const categoryNames = Object.keys(groupedProducts).sort();

  const groupedClients = clients.reduce((acc, client) => { if (!acc[client.location]) acc[client.location] = []; acc[client.location].push(client); return acc; }, {});
  const locationNames = Object.keys(groupedClients).sort();

  const openCategoryModal = (categoryName) => {
    const initialWeightsState = {};
    groupedProducts[categoryName].forEach(item => { initialWeightsState[item.weight_g || '0'] = true; });
    setExpandedWeights(initialWeightsState); setSelectedCategory(categoryName);
  };
  
  const toggleWeight = (weightKey) => setExpandedWeights(prev => ({ ...prev, [weightKey]: !prev[weightKey] }));
  const toggleLocation = (locationKey) => setExpandedLocations(prev => ({ ...prev, [locationKey]: !prev[locationKey] }));
  
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
              <InventoryPanel 
                setShowRestockModal={setShowRestockModal}
                searchInv={searchInv}
                setSearchInv={setSearchInv}
                products={products}
                formatProduct={formatProduct}
                centralInventory={centralInventory}
                mobileInventory={mobileInventory}
                stockInputs={stockInputs}
                setStockInputs={setStockInputs}
                ENDPOINTS={ENDPOINTS}
                setCentralInventory={setCentralInventory}
                setAppAlert={setAppAlert}
                setTransferModal={setTransferModal}
              />
            
            ) : showOrders ? (
              <SalesHistoryPanel 
                searchOrder={searchOrder} 
                setSearchOrder={setSearchOrder} 
                filterDate={filterDate} 
                setFilterDate={setFilterDate}
                filteredOrders={filteredOrders} 
                totalFilteredRevenue={totalFilteredRevenue} 
                expandedOrderId={expandedOrderId} 
                setExpandedOrderId={setExpandedOrderId}
              />

            ) : (
              <>
                {loading && <p className="text-brand-green font-bold text-lg animate-pulse">Cargando base de datos...</p>}
                {error && <p className="text-red-500 font-bold text-lg">{error}</p>}

                {!loading && !error && (
                  <>
                    {isAddingClient && !activeClient ? (
                      <AddClientForm 
                        setIsAddingClient={setIsAddingClient} 
                        handleCreateClient={handleCreateClient} 
                        clientForm={clientForm} 
                        setClientForm={setClientForm} 
                        isSubmitting={isSubmitting} 
                        captureLocation={captureLocation} 
                        isLocating={isLocating} 
                        routes={routes} 
                      />

                    ) : !activeClient ? (
                      <ClientDirectory 
                        clients={clients} 
                        groupedClients={groupedClients} 
                        locationNames={locationNames} 
                        expandedLocations={expandedLocations} 
                        toggleLocation={toggleLocation} 
                        setActiveClient={setActiveClient} 
                        setIsAddingClient={setIsAddingClient} 
                      />

                    ) : (
                      <StoreGrid 
                        activeClient={activeClient} 
                        setActiveClient={setActiveClient} 
                        saleMode={saleMode} 
                        setSaleMode={setSaleMode} 
                        clearCart={clearCart} 
                        cart={cart} 
                        categoryNames={categoryNames} 
                        groupedProducts={groupedProducts} 
                        formatProduct={formatProduct} 
                        CATEGORY_COVERS={CATEGORY_COVERS} 
                        openCategoryModal={openCategoryModal} 
                      />

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
            handleCheckout={() => handleCheckout(cart, totalOrder)}
          />
            
        </div>
      </div>
      
      <ExpenseModal 
        expenseModal={expenseModal} 
        setExpenseModal={setExpenseModal} 
        handleAddExpense={handleAddExpense} 
      />

      <AppAlertModal 
        appAlert={appAlert} 
        onClose={() => setAppAlert(prev => ({ ...prev, isOpen: false }))}   
      />

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

      <CategoryModal 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        groupedProducts={groupedProducts}
        expandedWeights={expandedWeights}
        toggleWeight={toggleWeight}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        handleSetQuantity={handleSetQuantity}
        formatProduct={formatProduct}
      />

    </div> 
  );
}

export default App;