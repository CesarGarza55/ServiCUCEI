import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../../Context/AuthContext';
import './Home.css';

export default function Home() {
  const { user, loading } = useAuth();
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const fadeInUp = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div className="home-bg">
      {/* Hero Section */}
      <header className="home-hero">
        <div className="particles-container" id="particles-js"></div>
        <div className="home-hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1 variants={itemVariants}>
              Servi<span className="brand-gradient">CUCEI</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="hero-subtitle">
              La plataforma definitiva para gestionar tus horas de servicio social en CUCEI.
            </motion.p>
            <motion.div variants={itemVariants} className="landing-buttons">
              {!user && (
              <>
                <Link to="/login" className="landing-btn primary pulse-animation">
                  <span>Iniciar sesión</span>
                  <svg width="13px" height="10px" viewBox="0 0 13 10">
                    <path d="M1,5 L11,5"></path>
                    <polyline points="8 1 12 5 8 9"></polyline>
                  </svg>
                </Link>
                <Link to="/register" className="landing-btn secondary">
                  <span>Registrarse</span>
                </Link>
              </>
              )}
              {user && (
                <Link to="/dashboard" className="landing-btn primary pulse-animation">
                  <span>Ir al Dashboard</span>
                  <svg width="13px" height="10px" viewBox="0 0 13 10">
                    <path d="M1,5 L11,5"></path>
                    <polyline points="8 1 12 5 8 9"></polyline>
                  </svg>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
        
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="scroller"></div>
          </div>
          <p>Desliza para descubrir</p>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="home-benefits">
        <div className="section-container">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
          >
            <h2 className="section-title">
              <span className="title-decoration">¿Qué puedes hacer?</span>
            </h2>
            <p className="section-description">
              ServiCUCEI te permite gestionar tu servicio social de manera sencilla y transparente.
            </p>
          </motion.div>

          <div className="benefits-grid">
            <motion.div
              className="benefit-card"
              initial="hidden"
              animate={controls}
              variants={itemVariants}
            >
              <div className="benefit-icon">📝</div>
              <h3>Registrar tu servicio social</h3>
              <p>Elige y regístrate en el programa de servicio social que más te interese.</p>
            </motion.div>
            <motion.div
              className="benefit-card"
              initial="hidden"
              animate={controls}
              variants={itemVariants}
            >
              <div className="benefit-icon">⏰</div>
              <h3>Registrar tus horas</h3>
              <p>Captura fácilmente tus horas de entrada y salida cada día.</p>
            </motion.div>
            <motion.div
              className="benefit-card"
              initial="hidden"
              animate={controls}
              variants={itemVariants}
            >
              <div className="benefit-icon">✅</div>
              <h3>Que tus horas sean aprobadas</h3>
              <p>Un profesor revisa y aprueba tus horas para que cuenten oficialmente.</p>
            </motion.div>
            <motion.div
              className="benefit-card"
              initial="hidden"
              animate={controls}
              variants={itemVariants}
            >
              <div className="benefit-icon">📊</div>
              <h3>Ver tu avance</h3>
              <p>Consulta cuántas horas llevas acumuladas y tu progreso en tiempo real.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="home-steps">
        <div className="section-container">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
          >
            <h2 className="section-title">
              <span className="title-decoration">Cómo</span> funciona
            </h2>
            <p className="section-description">
              En solo 4 sencillos pasos podrás completar tu servicio social sin complicaciones.
            </p>
          </motion.div>

          <div className="steps-timeline">
            {[
              {
                title: 'Registro inicial',
                description: 'Crea tu cuenta con tu correo institucional y datos básicos.'
              },
              {
                title: 'Selección de servicio',
                description: 'Elige entre los programas de servicio social disponibles.'
              },
              {
                title: 'Registro de horas',
                description: 'Marca tu entrada y salida con geovalidación opcional.'
              },
              {
                title: 'Constancia digital',
                description: 'Descarga tu documento oficial al completar tus horas.'
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="step-item"
                initial="hidden"
                animate={controls}
                variants={itemVariants}
                custom={index}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                {index < 3 && <div className="step-connector"></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-testimonials">
        <div className="section-container">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
          >
            <h2 className="section-title">
              <span className="title-decoration">Opiniones</span> de usuarios
            </h2>
            <p className="section-description">
              Lo que dicen nuestros estudiantes y profesores sobre la plataforma.
            </p>
          </motion.div>

          <div className="testimonials-slider">
            {[
              {
                quote: "ServiCUCEI simplificó enormemente la gestión del servicio social. Ahora puedo enfocarme en lo importante.",
                author: "María González",
                role: "Estudiante de Ingeniería"
              },
              {
                quote: "Como supervisor, la plataforma me ahorra horas de trabajo administrativo. La recomiendo 100%.",
                author: "Dr. Carlos Ruiz",
                role: "Profesor Titular"
              },
              {
                quote: "La interfaz es tan intuitiva que no tuve que preguntar cómo usarla. Todo está donde debe estar.",
                author: "Javier Morales",
                role: "Estudiante de Licenciatura"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="testimonial-card"
                initial="hidden"
                animate={controls}
                variants={itemVariants}
                custom={index}
              >
                <div className="quote-icon">“</div>
                <p className="testimonial-text">{testimonial.quote}</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <strong>{testimonial.author}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <div className="cta-container">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={fadeInUp}
          >
            <h2>¿Listo para transformar tu experiencia de servicio social?</h2>
            <p>
              Únete a miles de estudiantes que ya están disfrutando de los beneficios de ServiCUCEI.
            </p>
            {!user && (
            <Link to="/register" className="cta-btn mega-pulse">
              <span>Comienza ahora</span>
              <svg width="18px" height="14px" viewBox="0 0 18 14">
                <path d="M1,7 L16,7"></path>
                <polyline points="12 1 17 7 12 13"></polyline>
              </svg>
            </Link>
            )}
            {user && (
              <Link to="/dashboard" className="cta-btn mega-pulse">
                <span>Ir al Dashboard</span>
                <svg width="18px" height="14px" viewBox="0 0 18 14">
                  <path d="M1,7 L16,7"></path>
                  <polyline points="12 1 17 7 12 13"></polyline>
                </svg>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}