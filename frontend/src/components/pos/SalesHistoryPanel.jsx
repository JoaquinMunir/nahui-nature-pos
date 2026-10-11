export default function SalesHistoryPanel({
  searchOrder, setSearchOrder, filterDate, setFilterDate, 
  filteredOrders, totalFilteredRevenue, 
  expandedOrderId, setExpandedOrderId
}) {
  return (
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

    {filteredOrders.length === 0 ? (
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
  );
}