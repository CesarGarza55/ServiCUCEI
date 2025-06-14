import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import RegisterHours from './pages/RegisterHours/RegisterHours';
import RegisterSocialService from './pages/RegisterSocialService/RegisterSocialService';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Loading from './components/Loading/Loading';
import { useAuth } from './Context/AuthContext';
import './assets/styles/base.css';
import './App.css';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register-hours" element={<RegisterHours />} />
            <Route path="/register-service" element={<RegisterSocialService />} />   
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}