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
import RouteActions from './components/pos/RouteActions';

import { usePOSData } from './hooks/usePOSData';
import { useCart } from './hooks/useCart';
import { useInventory } from './hooks/useInventory';
import { useRouteSession } from './hooks/useRouteSession';
import { useClients } from './hooks/useClients';
import { useSalesHistory } from './hooks/useSalesHistory';

function App() {
  // 1. Estado de UI local
  const [appAlert, setAppAlert] = useState({ isOpen: false, title: '', message: '', type: 'error' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
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
    handleAddCentralStock, handleTransferToMobile,
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
    groupedProducts, categoryNames, groupedClients, locationNames
  } = usePOSData({ ENDPOINTS, setAppAlert, fetchInventories, saleMode, setMobileInventory, setCentralInventory, isOnRoad, clearCart, setIsSubmitting });

  // 6. Alta de clientes
  const {
    isAddingClient, setIsAddingClient, isLocating, clientForm,
    setClientForm, captureLocation, handleCreateClient,
  } = useClients({ ENDPOINTS, setAppAlert, routes, setRoutes, setClients, setIsSubmitting });

  // 7. Historial de ventas
  const {
    searchOrder, setSearchOrder, filterDate, setFilterDate,
    expandedOrderId, setExpandedOrderId, filteredOrders, totalFilteredRevenue,
  } = useSalesHistory(ordersHistory);

  // 8. Estado de la vista
  const isStoreView = !showInventory && !showOrders && activeClient;

  const openCategoryModal = (categoryName) => {
    const initialWeightsState = {};
    groupedProducts[categoryName].forEach(item => { initialWeightsState[item.weight_g || '0'] = true; });
    setExpandedWeights(initialWeightsState); setSelectedCategory(categoryName);
  };
  
  const toggleWeight = (weightKey) => setExpandedWeights(prev => ({ ...prev, [weightKey]: !prev[weightKey] }));
  const toggleLocation = (locationKey) => setExpandedLocations(prev => ({ ...prev, [locationKey]: !prev[locationKey] }));

  return (

    <div className="min-h-screen relative bg-brand-bg flex flex-col max-lg:landscape:pt-[60px]">
      
      <POSHeader 
        routeActions={
          <RouteActions
            isOfflineMode={isOfflineMode}
            isOnRoad={isOnRoad}
            onStartRoute={handleStartRoute}
            onEndRoute={handleEndRoute}
            onOpenExpense={() => setExpenseModal({ isOpen: true, concept: '', amount: '' })}
          />
        }        isStoreView={isStoreView}
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
                onAddCentralStock={handleAddCentralStock}
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
        onSubmit={handleTransferToMobile}
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