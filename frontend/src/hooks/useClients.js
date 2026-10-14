import { useState } from 'react';
import axios from 'axios';
import { db } from '../db';

// Si el valor escrito coincide con uno existente (sin importar mayúsculas ni espacios),
/// Clave de comparación: sin acentos, sin mayúsculas. "Armería" y "armeria" → "armeria".
const toMatchKey = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Si el valor escrito coincide con uno existente (sin importar mayúsculas, acentos ni espacios),
// devuelve la escritura ya registrada para no duplicar agrupadores.
const matchExisting = (value, existingValues) => {
  const clean = (value || '').trim().replace(/\s+/g, ' ');
  const key = toMatchKey(clean);
  return existingValues.find((option) => toMatchKey(option) === key) ?? clean;
};

export function useClients({ ENDPOINTS, setAppAlert, routes, setRoutes, setClients, setIsSubmitting, locationNames}) {
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '', contact: '', phone_number: '', address: '', location: '', route_name: '', latitude: '', longitude: ''
  });

  const captureLocation = () => {
    if (!navigator.geolocation) { 
      setAppAlert({ isOpen: true, title: 'GPS Inactivo', message: 'Tu dispositivo no soporta GPS.', type: 'error' }); 
      return; 
    }
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
      () => {
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
    const routeNameStr = matchExisting(clientForm.route_name, (routes || []).map(r => r.name));
    const locationStr = matchExisting(clientForm.location, locationNames || []);

    const routeExists = (routes || []).some(r => r.name === routeNameStr);
    if (!routeExists && routeNameStr !== "") {
      const newRoute = { id: crypto.randomUUID(), name: routeNameStr };
      setRoutes(prev => [...(prev || []), newRoute].sort((a,b) => a.name.localeCompare(b.name)));
      db.routes.add(newRoute).catch(() => {});
    }

    const newClient = {
      ...clientForm,
      location: locationStr,
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
    } catch {
      try {
        await db.clients.add(newClient);
        await db.sync_clients_queue.add(newClient);
        setClients(prev => [...(prev || []), newClient].sort((a, b) => a.location.localeCompare(b.location) || a.name.localeCompare(b.name)));
        setAppAlert({ isOpen: true, title: 'Guardado Local', message: 'Modo sin conexión: El cliente se guardó en tu dispositivo.', type: 'warning' });
      } catch (dbError) {
        console.error('Error guardando el cliente localmente:', dbError);
        setAppAlert({ isOpen: true, title: 'Error Crítico', message: 'Error de almacenamiento local.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
      setIsAddingClient(false);
      setClientForm({ name: '', contact: '', phone_number: '', address: '', location: '', route_name: '', latitude: '', longitude: '' });
    }
  };

  return {
    isAddingClient, setIsAddingClient,
    isLocating, setIsLocating,
    clientForm, setClientForm,
    captureLocation, handleCreateClient
  };
}