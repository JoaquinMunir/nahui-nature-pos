import React from 'react';

export default function ShiftReportModal({
  showShiftReport,
  setShowShiftReport,
  shiftStats,
  expenses,
  mobileInventory,
  products,
  confirmEndRoute
}) {
  if (!showShiftReport) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowShiftReport(false)}></div>
      <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        <div className="bg-brand-brown p-6 text-white text-center relative flex-shrink-0">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-2xl font-calistoga mb-1 tracking-wide">Corte de Ruta</h3>
          <p className="text-brand-bg/80 text-xs font-bold uppercase tracking-widest">Auditoría del Turno Actual</p>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-brand-bg">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-brand-brown/10">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ingresos por Ventas</p>
              <p className="text-sm font-medium text-brand-brown">{shiftStats.orderCount} pedidos completados</p>
            </div>
            <span className="text-xl font-black text-brand-green">+ ${shiftStats.totalSales.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-brown/10">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gastos Operativos</p>
              <p className="text-sm font-medium text-brand-brown">{expenses.length} conceptos registrados</p>
            </div>
            <span className="text-xl font-black text-red-500">- ${shiftStats.totalExpenses.toFixed(2)}</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-brand-brown/10 mb-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-green"></div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Efectivo Neto a Entregar</p>
            <p className="text-4xl font-black text-brand-brown">${shiftStats.netCash.toFixed(2)}</p>
          </div>

          <div>
             <p className="text-[10px] font-bold text-brand-green uppercase tracking-widest mb-2 flex items-center gap-1.5">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
               Mercancía a devolver (Camioneta)
             </p>
             <div className="max-h-32 overflow-y-auto bg-white rounded-xl p-3 border border-brand-brown/10 shadow-sm">
               {mobileInventory.filter(i => i.stock_quantity > 0).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center font-bold my-2 uppercase tracking-widest">Camioneta vacía</p>
               ) : (
                  mobileInventory.filter(i => i.stock_quantity > 0).map(inv => {
                    const prod = products.find(p => String(p.id) === String(inv.product_id));
                    if(!prod) return null;
                    const isSingle = prod.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'unico';
                    const name = isSingle ? prod.category : `${prod.category} - ${prod.name}`;
                    return (
                      <div key={inv.product_id} className="flex justify-between items-center text-sm mb-2 last:mb-0 border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                         <span className="text-brand-brown font-medium truncate pr-2 text-xs">{name}</span>
                         <span className="font-black text-brand-green bg-brand-green/10 px-2 py-0.5 rounded shadow-sm text-xs">{inv.stock_quantity} u.</span>
                      </div>
                    )
                  })
               )}
             </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-brand-brown/10 flex gap-3 flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <button type="button" onClick={() => setShowShiftReport(false)} className="flex-1 bg-gray-50 text-gray-500 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 uppercase tracking-wider text-xs shadow-sm">Revisar algo</button>
          <button type="button" onClick={confirmEndRoute} className="flex-1 bg-brand-green text-white font-black py-3.5 rounded-xl hover:bg-brand-green-dark transition-colors shadow-md active:scale-95 uppercase tracking-wider text-xs">Confirmar Cierre</button>
        </div>
       </div>
      </div>
  );
}