import axios from 'axios';

export default function InventoryPanel({
  setShowRestockModal, searchInv, setSearchInv, products, formatProduct,
  centralInventory, mobileInventory, stockInputs, setStockInputs,
  ENDPOINTS, setCentralInventory, setAppAlert, setTransferModal
}) {
  return (
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
              type="text" placeholder="Buscar producto o variante..." value={searchInv} onChange={(e) => setSearchInv(e.target.value)}
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
          {products.filter(p => {
              const term = searchInv.toLowerCase();
              return p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
            }).map(product => {
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
                      type="number" min="1" placeholder="Cant." value={inputValue}
                      onChange={(e) => setStockInputs(prev => ({...prev, [product.id]: e.target.value}))}
                      className="w-16 sm:w-20 pl-1 pr-1 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-brand-green outline-none font-bold text-brand-brown transition-colors text-sm text-center shadow-sm" 
                    />
                    <button 
                      title="Ingresar mercancía al Centro"
                      onClick={async () => {
                        if(!inputValue || isNaN(inputValue) || Number(inputValue) <= 0) return;
                        try {
                          const res = await axios.post(`${ENDPOINTS.inventory}/add`, { product_id: product.id, quantity: Number(inputValue) });
                          if (res.data.status === 'success') {
                            setCentralInventory(prev => {
                              const exists = prev.find(i => String(i.product_id) === String(product.id));
                              if (exists) return prev.map(i => String(i.product_id) === String(product.id) ? { ...i, stock_quantity: res.data.new_stock } : i);
                              return [...prev, { product_id: product.id, stock_quantity: res.data.new_stock }];
                            });
                            setStockInputs(prev => ({...prev, [product.id]: ''}));
                            setAppAlert({ isOpen: true, title: 'Actualizado', message: 'Ingresado a central.', type: 'success' });
                          }
                        } catch (error) { setAppAlert({ isOpen: true, title: 'Error', message: 'No se pudo ingresar.', type: 'error' }); }
                      }}
                      className="bg-brand-green text-white font-bold px-3 py-2 rounded-lg hover:bg-brand-green-dark transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-sm hidden xl:inline">Ingresar</span>
                    </button>
                    <button 
                      title="Mover al Movil"
                      onClick={() => {
                        if (stockCasa === 0) return setAppAlert({ isOpen: true, title: 'Stock', message: 'No hay stock en Centro.', type: 'error' });
                        setTransferModal({ isOpen: true, product: product, stockCasa: stockCasa, qty: '' });
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
  );
}