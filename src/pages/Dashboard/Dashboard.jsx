import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [serviceHours, setServiceHours] = useState([]);
  const [pendingHours, setPendingHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const aprobarHora = async (id) => {
    try {
      // 1. Obtener la hora antes de aprobar
      const { data: hourData, error: hourError } = await supabase
        .from('service_hours')
        .select('enroll_id, duration')
        .eq('id', id)
        .single();

      if (hourError) throw hourError;

      // 2. Aprobar la hora
      const { error: updateError } = await supabase
        .from('service_hours')
        .update({ 
          status: 'approved',
          professor_id: user.id 
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // 3. Recalcular total_hours desde cero
      const { data: approvedHours, error: sumError } = await supabase
        .from('service_hours')
        .select('duration')
        .eq('enroll_id', hourData.enroll_id)
        .eq('status', 'approved');

      if (sumError) throw sumError;

      const newTotal = approvedHours.reduce((sum, h) => sum + (h.duration || 0), 0);

      // 4. Actualizar enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .update({ total_hours: newTotal })
        .eq('id', hourData.enroll_id);

      if (enrollError) throw enrollError;

      // 5. Actualizar UI
      fetchPendingHours();
      if (user?.role === 'student') {
        const { data: updatedEnrollment } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setEnrollment(updatedEnrollment);
      }
    } catch (err) {
      setError('Error al aprobar horas');
      console.error(err);
    }
  };

  const rechazarHora = async (id) => {
    try {
      await supabase.from('service_hours').update({ 
        status: 'rejected',
        professor_id: user.id // Registrar qué profesor rechazó
      }).eq('id', id);
      
      fetchPendingHours();
      
      // Si el usuario actual es estudiante, refrescar sus datos
      if (user?.role === 'student') {
        const { data: updatedEnrollment, error: updatedError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!updatedError) setEnrollment(updatedEnrollment);
        
        const { data: hours, error: hoursError } = await supabase
          .from('service_hours')
          .select('*')
          .eq('enroll_id', enrollment?.id);
        
        if (!hoursError) setServiceHours(hours || []);
      }
    } catch (err) {
      setError('Error al rechazar horas');
      console.error(err);
    }
  };

  // Memoize fetchPendingHours to prevent unnecessary recreations
  const fetchPendingHours = useCallback(async () => {
    if (!user || (user.role !== 'professor' && user.role !== 'admin')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Find social services where professor is enrolled
      const { data: profEnrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('social_service_id')
        .eq('user_id', user.id);

      if (enrollError) throw enrollError;

      const serviceIds = profEnrollments?.map(e => e.social_service_id) || [];
      if (serviceIds.length === 0) {
        setPendingHours([]);
        return;
      }

      // 2. Find students enrolled in those services (excluding the professor)
      // First get enrollments with user_id
      let { data: enrollments, error: studentError } = await supabase
        .from('enrollments')
        .select('id, user_id')
        .in('social_service_id', serviceIds)
        .neq('user_id', user.id);

      if (studentError) throw studentError;

      const enrollmentIds = enrollments?.map(e => e.id) || [];
      const userIds = enrollments?.map(e => e.user_id) || [];
      
      if (enrollmentIds.length === 0) {
        setPendingHours([]);
        return;
      }

      // 3. Get user profiles for these users
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to full_name
      const userProfileMap = {};
      userProfiles?.forEach(profile => {
        userProfileMap[profile.id] = profile.full_name;
      });

      // 4. Get pending hours for those enrollments
      const { data: hours, error: hoursError } = await supabase
        .from('service_hours')
        .select('*')
        .in('enroll_id', enrollmentIds)
        .eq('status', 'pending');

      if (hoursError) throw hoursError;

      // Combine the data
      const hoursWithNames = (hours || []).map(hour => {
        const enrollment = enrollments.find(e => e.id === hour.enroll_id);
        return {
          ...hour,
          enrollments: {
            user_id: enrollment?.user_id,
            user_profiles: {
              full_name: userProfileMap[enrollment?.user_id] || 'Unknown'
            }
          }
        };
      });

      setPendingHours(hoursWithNames);
    } catch (err) {
      setError('Error al cargar horas pendientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // For students: fetch their own data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') return;

    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch enrollment
        const { data, error: enrollError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (enrollError) throw enrollError;
        
        setEnrollment(data);

        // Fetch service hours if enrollment exists
        if (data) {
          const { data: hours, error: hoursError } = await supabase
            .from('service_hours')
            .select('*')
            .eq('enroll_id', data.id)
            .order('created_at', { ascending: false }); // Ordenar por fecha

          if (hoursError) throw hoursError;
          
          setServiceHours(hours || []);
        }
      } catch (err) {
        setError('Error al cargar datos del estudiante');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, navigate, pendingHours]); // Añadir pendingHours como dependencia

  // For professors/admins: fetch pending hours
  useEffect(() => {
    if (user?.role === 'professor' || user?.role === 'admin') {
      fetchPendingHours();
    }
  }, [user, fetchPendingHours]);

  if (!user) return null;

  const generarCertificado = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener información del profesor encargado
      const { data: profesor, error: profesorError } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('role', 'professor')
        .limit(1);

      if (profesorError) throw profesorError;

      // 2. Obtener información del servicio social
      const { data: servicio, error: servicioError } = await supabase
        .from('enrollments')
        .select('social_services(name)')
        .eq('id', enrollment.id)
        .single();

      if (servicioError) throw servicioError;

      // 3. Crear el PDF con mejor diseño
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Margenes y dimensiones
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const center = pageWidth / 2;

      // Estilo de fuente
      const normalFont = { font: 'helvetica', style: 'normal' };
      const boldFont = { font: 'helvetica', style: 'bold' };

      const imgData = './assets/logo_udg.png'
      doc.addImage(imgData, 'PNG', 20, 20, 30, 30);

      // Encabezado
      doc.setFontSize(16);
      doc.setTextColor(0, 51, 102);
      doc.setFont(boldFont.font, boldFont.style);
      doc.text('CENTRO UNIVERSITARIO DE CIENCIAS EXACTAS E INGENIERÍAS', center, margin, { align: 'center' });
      doc.text('CUCEI - UNIVERSIDAD DE GUADALAJARA', center, margin + 8, { align: 'center' });
      
      // Título del certificado
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text('CERTIFICADO DE SERVICIO SOCIAL', center, margin + 25, { align: 'center' });

      // Línea decorativa
      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

      // Cuerpo del certificado
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);

      let y = margin + 55;
      const cuerpo = [
        'Por este medio se certifica que:',
        '',
        `${user.name || 'Nombre del Estudiante'}`,
        `Matrícula: ${user.code || user.matricule || 'Código del Estudiante'}`,
        '',
        `Ha completado satisfactoriamente 480 horas de servicio social`,
        `en el programa: "${servicio.social_services.name}"`,
        '',
        'Cumpliendo con todos los requisitos establecidos en el reglamento de servicio social,',
        'según los registros oficiales de esta institución.',
        '',
        `Guadalajara, Jalisco a ${new Date().toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`
      ];

      cuerpo.forEach(line => {
        if (line === '') {
          y += 6;
        } else {
          doc.text(line, center, y, { align: 'center' });
          y += 8;
        }
      });
      let yPosition = y-8;
      // Firma
      yPosition += 20;
      doc.text('___________________________', center, yPosition, { align: 'center' });
      yPosition += 7;
      doc.setFont(boldFont.font, boldFont.style);
      doc.text(profesor[0]?.full_name || 'Profesor Encargado', center, yPosition, { align: 'center' });
      yPosition += 5;
      doc.setFont(normalFont.font, normalFont.style);
      doc.text('Responsable del Servicio Social', center, yPosition, { align: 'center' });

      // Pie de página
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Documento generado electrónicamente - CUCEI', center, 280, { align: 'center' });

      // Guardar el PDF
      doc.save(`certificado_servicio_social_${user.matricule || user.id}.pdf`);
      
    } catch (err) {
      setError('Error al generar el certificado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bienvenido, {user?.name}</h1>
        <p>Panel de control del servicio social</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Cargando...</div>}

      <div className="dashboard-cards">
        {user?.role === 'student' && enrollment && (
          <div className="dashboard-card primary">
            <h3>Horas Registradas</h3>
            <p className="stat">{enrollment.total_hours}</p>
            <div className="hours-progress">
              <div 
                className="hours-progress-bar" 
                style={{ width: `${Math.min(100, (enrollment.total_hours / 480) * 100)}%` }}
              ></div>
            </div>
            <p>de 480 horas requeridas</p>
            {enrollment.total_hours >= 480 && (
              <button 
                className="download-certificate"
                onClick={generarCertificado}
              >
                Descargar Certificado
              </button>
            )}
          </div>
        )}

        {(user?.role === 'professor' || user?.role === 'admin') && (
          <div className="dashboard-card approval-list">
            <h3>Solicitudes de Horas Pendientes</h3>
            <ul>
              {pendingHours.length === 0 && (
                <li>No hay solicitudes pendientes.</li>
              )}
              {pendingHours.map((hour) => (
                <li key={hour.id}>
                  <strong>Alumno:</strong> {hour.enrollments?.user_profiles?.full_name || hour.enrollments?.user_id}
                  <br />
                  <strong>Horas:</strong> {hour.duration || 0}
                  <br />
                  <strong>Fecha:</strong> {new Date(hour.check_in).toLocaleDateString()}
                  <div className="action-buttons">
                    <button onClick={() => aprobarHora(hour.id)}>Aprobar</button>
                    <button onClick={() => rechazarHora(hour.id)}>Rechazar</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="dashboard-card accent">
          <h3>Actividad Reciente</h3>
          <ul className="activity-list">
            {serviceHours.map((hour) => (
              <li key={hour.id} className={`hour-status-${hour.status}`}>
                {hour.status === 'approved' && `Horas aprobadas - ${hour.duration} horas`}
                {hour.status === 'rejected' && `Horas rechazadas - ${hour.duration} horas`}
                {hour.status === 'pending' && `Registro de horas - ${hour.duration || 0} horas pendientes`}
                <div className="hour-date">
                  {new Date(hour.check_in).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}