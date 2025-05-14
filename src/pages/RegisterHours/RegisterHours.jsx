import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../Context/AuthContext';
import './RegisterHours.css';

export default function RegisterHours() {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [message, setMessage] = useState('');

  const convertToUTC = (dateString, timeZone) => {
    const date = new Date(dateString);
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone }));
    return utcDate.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!enrollment) {
      setMessage('No estás inscrito en ningún servicio social.');
      return;
    }

    try {
      // Convierte las fechas a UTC usando la zona horaria de México
      const timeZone = 'America/Mexico_City';
      const checkInUtc = convertToUTC(checkIn, timeZone);
      const checkOutUtc = convertToUTC(checkOut, timeZone);

      const { error } = await supabase.from('service_hours').insert({
        enroll_id: enrollment.id,
        check_in: checkInUtc,
        check_out: checkOutUtc,
      });

      if (error) {
        setMessage('Error al registrar las horas.');
        console.error(error);
      } else {
        setMessage('Horas registradas exitosamente.');
      }
    } catch (err) {
      console.error('Error al procesar las fechas:', err);
      setMessage('Error al procesar las fechas.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Hora de entrada:
        <input
          type="datetime-local"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
      </label>
      <label>
        Hora de salida:
        <input
          type="datetime-local"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </label>
      <button type="submit">Registrar Horas</button>
      {message && <p>{message}</p>}
    </form>
  );
}