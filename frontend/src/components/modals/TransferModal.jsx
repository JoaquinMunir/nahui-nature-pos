import React from 'react';
import axios from 'axios';

export default function TransferModal({
  transferModal,
  setTransferModal,
  formatProduct,
  setCentralInventory,
  setMobileInventory,
  setAppAlert,
  ENDPOINTS
}) {
  if (!transferModal.isOpen || !transferModal.product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setTransferModal({ ...transferModal, isOpen: false })}></div>
      
      <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-600 p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>
          <h3 className="text-2xl font-calistoga mb-1 tracking-wide">Traspaso a Ruta</h3>
          <p className="text-blue-100 text-sm font-medium">Carga de vehículo móvil</p>
        </div>
        
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            const qty = parseInt(transferModal.qty, 10);
            if (isNaN(qty) || qty <= 0) return alert("Ingresa un número válido.");
            if (qty > transferModal.stockCasa) return alert(`❌ No puedes traspasar ${qty}. Solo hay ${transferModal.stockCasa}.`);
            
            try {
              const res = await axios.post(ENDPOINTS.transfer, {
                product_id: transferModal.product.id,
                quantity: qty,
                route_name: "Ruta 1"
              });
              
              if (res.data.status === 'success') {
                setCentralInventory(prev => prev.map(i => 
                  String(i.product_id) === String(transferModal.product.id) 
                  ? { ...i, stock_quantity: res.data.new_central_stock } : i
                ));
                setMobileInventory(prev => {
                  const exists = prev.find(i => String(i.product_id) === String(transferModal.product.id));
                  if (exists) return prev.map(i => String(i.product_id) === String(transferModal.product.id) ? { ...i, stock_quantity: res.data.new_mobile_stock } : i);
                  return [...prev, { product_id: transferModal.product.id, stock_quantity: res.data.new_mobile_stock }];
                });
                setTransferModal({ isOpen: false, product: null, stockCasa: 0, qty: '' });
              }
            } catch (error) {
              setAppAlert({ isOpen: true, title: 'Error', message: 'Error de conexión al intentar el traspaso.', type: 'error' });
            }
          }} 
          className="p-6"
        >
          <div className="mb-6 text-center">
            <p className="font-bold text-brand-brown text-lg leading-tight">
              {formatProduct(transferModal.product).cartTitle}
            </p>
            {transferModal.product.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") !== 'unico' && (
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                {transferModal.product.name} {transferModal.product.weight_g ? `(${transferModal.product.weight_g}g)` : ''}
              </p>
            )}
            <div className="inline-flex items-center gap-1.5 mt-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Disponible en Casa:</span>
              <span className="font-black text-brand-green">{transferModal.stockCasa} u.</span>
            </div>
          </div>
          
          <div className="mb-8">
            <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 text-center">Cantidad a Traspasar</label>
            <input 
              type="number" 
              min="1"
              max={transferModal.stockCasa}
              autoFocus
              value={transferModal.qty}
              onChange={(e) => setTransferModal({ ...transferModal, qty: e.target.value })}
              className="w-full text-center text-5xl font-black text-brand-brown border-b-2 border-gray-200 focus:border-blue-600 outline-none pb-2 transition-colors bg-transparent"
              placeholder="0"
            />
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={() => setTransferModal({ ...transferModal, isOpen: false })} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wider text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={!transferModal.qty || transferModal.qty <= 0} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md active:scale-95 disabled:bg-gray-300 disabled:shadow-none uppercase tracking-wider text-sm flex items-center justify-center gap-2">
              Confirmar <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}