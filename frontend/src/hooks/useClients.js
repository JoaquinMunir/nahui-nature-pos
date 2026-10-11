import { useState } from 'react';
import axios from 'axios';
import { db } from '../db';

export function useClients({ ENDPOINTS, setAppAlert, routes, setRoutes, setClients, setIsSubmitting }) {
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
      (error) => {
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
    const routeNameStr = (clientForm.route_name || "").trim();

    const routeExists = (routes || []).some(r => r?.name?.toLowerCase() === routeNameStr.toLowerCase());
    if (!routeExists && routeNameStr !== "") {
      const newRoute = { id: crypto.randomUUID(), name: routeNameStr };
      setRoutes(prev => [...(prev || []), newRoute].sort((a,b) => a.name.localeCompare(b.name)));
      db.routes.add(newRoute).catch(() => {});
    }

    const newClient = {
      ...clientForm,
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
    } catch (error) {
      try {
        await db.clients.add(newClient);
        await db.sync_clients_queue.add(newClient);
        setClients(prev => [...(prev || []), newClient].sort((a, b) => a.location.localeCompare(b.location) || a.name.localeCompare(b.name)));
        setAppAlert({ isOpen: true, title: 'Guardado Local', message: 'Modo sin conexión: El cliente se guardó en tu dispositivo.', type: 'warning' });
      } catch (dbError) {
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