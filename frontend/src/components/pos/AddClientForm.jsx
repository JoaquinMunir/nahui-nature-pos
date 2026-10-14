export default function AddClientForm({
  setIsAddingClient, handleCreateClient, clientForm, setClientForm, 
  isSubmitting, captureLocation, isLocating, routes, locationNames
}) {
  return (
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
              <input
                required
                type="text"
                list="comunidades-registradas"
                value={clientForm.location}
                onChange={e => setClientForm({...clientForm, location: e.target.value})}
                placeholder="Escribe o selecciona una comunidad..."
                className="w-full bg-brand-bg rounded-xl border border-brand-brown/10 p-3 outline-none focus:border-brand-green transition-colors text-brand-brown"
              />
              <datalist id="comunidades-registradas">
                {(locationNames || []).map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Selecciona una existente o teclea una nueva.</p>
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
  );
}