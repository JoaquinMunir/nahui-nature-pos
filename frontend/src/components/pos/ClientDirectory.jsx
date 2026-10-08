import React from 'react';

export default function ClientDirectory({
  clients,
  groupedClients,
  locationNames,
  expandedLocations,
  toggleLocation,
  setActiveClient,
  setIsAddingClient
}) {
  return (
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
  );
}