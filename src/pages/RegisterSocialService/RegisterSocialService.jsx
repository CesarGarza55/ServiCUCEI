import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../Context/AuthContext';
import './RegisterSocialService.css';

export default function RegisterSocialService() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('social_services')
        .select('*');

      if (error) {
        console.error('Error fetching services:', error);
        setMessage('Error al cargar los servicios sociales.');
      } else {
        setServices(data);
      }
    };

    const checkEnrollment = async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) setAlreadyEnrolled(true);
    };

    fetchServices();
    if (user) checkEnrollment();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      setMessage('Por favor, selecciona un servicio social.');
      return;
    }

    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      social_service_id: selectedService,
    });

    if (error) {
      setMessage('Error al registrarte en el servicio social.');
      console.error(error);
    } else {
      setMessage('Te has registrado exitosamente en el servicio social.');
      setAlreadyEnrolled(true);
    }
  };

  return (
    <div className="register-service-container">
      <h2>Registrar Servicio Social</h2>
      {alreadyEnrolled ? (
        <p>Ya estás registrado en un servicio social.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Selecciona un servicio social:
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              required
            >
              <option value="">-- Selecciona --</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Registrar</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}