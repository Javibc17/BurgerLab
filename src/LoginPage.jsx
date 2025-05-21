import React, { useState } from "react";
import api from "./api";
import "./App.css";
import logoSolo from './assets/logo.png';
import logo from './assets/logoLetrasRojo.png';
import eyeOff from './assets/proicons--eye-off.svg';
import eyeOn from './assets/proicons--eye.svg';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");
    let hasError = false;
    if (!validarEmail(email)) {
      setEmailError("Introduce un email válido.");
      hasError = true;
    }
    if (!password || password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      hasError = true;
    }
    if (hasError) return;
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      setLoading(false);
      if (onLogin) onLogin(res.data);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error || "Error de inicio de sesión";
      if (msg.toLowerCase().includes("usuario no encontrado")) {
        setEmailError("El correo no está registrado.");
      } else if (msg.toLowerCase().includes("contraseña incorrecta")) {
        setPasswordError("La contraseña es incorrecta.");
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div
      className="login-page-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `#f4c2c2`,
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <img src={logo} alt="Burger Lab Logo" style={{ width: 220, height: 'auto', marginBottom: 0, marginTop: 0, zIndex: 10, position: 'relative' }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {[...Array(18)].map((_, i) => {
          const positions = [
            { top: 30, left: 30 },
            { top: 120, right: 60 },
            { bottom: 60, left: 80 },
            { bottom: 30, right: 30 },
            { top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-5deg)', display: 'none' },
            { bottom: 0, right: '50%', transform: 'translateX(50%) rotate(-8deg)' },
            { top: 200, left: 200, transform: 'rotate(18deg)' },
            { bottom: 180, right: 120, transform: 'rotate(-15deg)' },
            { top: 320, right: 40, transform: 'rotate(22deg)' },
            { top: 80, left: 300, transform: 'rotate(-20deg)' },
            { bottom: 100, left: 250, transform: 'rotate(12deg)' },
            { top: 250, right: 200, transform: 'rotate(15deg)' },
            { bottom: 250, right: 200, transform: 'rotate(-10deg)' },
            { top: 400, left: 100, transform: 'rotate(8deg)' },
            { top: 60, right: 200, transform: 'rotate(-18deg)' },
            { bottom: 60, right: 300, transform: 'rotate(14deg)' },
            { top: 180, left: 400, transform: 'rotate(-7deg)' },
          ];
          const sizes = [60, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 200, 220, 240, 260, 280, 300];
          const pos = positions[i % positions.length];
          if (pos.display === 'none') return null;
          const style = {
            position: 'absolute',
            width: sizes[i % sizes.length],
            opacity: 0.32,
            pointerEvents: 'none',
            zIndex: 1,
            ...pos
          };
          return <img key={i} src={logoSolo} alt="bg-logo" style={style} />;
        })}
      </div>
      <form onSubmit={handleSubmit} className="login-form" style={{ background: "#fff", padding: 36, borderRadius: 16, boxShadow: "0 4px 24px #e6394633", minWidth: 440, maxWidth: 520, zIndex: 2, position: 'relative', width: 440, marginTop: 24 }}>
        <h2 style={{ color: "#e63946", fontFamily: "Chewy, system-ui", textAlign: "center", marginBottom: 24 }}>Iniciar sesión</h2>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <a href="/register" style={{ color: "#457b9d", textDecoration: "underline", fontFamily: 'Chewy, system-ui', fontSize: 17 }}>¿No tienes cuenta? Crear cuenta</a>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, display: 'block', color: '#e63946', letterSpacing: 0.2, fontFamily: 'Chewy, system-ui' }}>
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 14, borderRadius: 8, border: "1.5px solid #e63946", fontSize: 18, boxSizing: 'border-box' }}
          />
          {emailError && <div style={{ color: '#e63946', fontSize: 13, marginTop: 2 }}>{emailError}</div>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, display: 'block', color: '#e63946', letterSpacing: 0.2, fontFamily: 'Chewy, system-ui' }}>
            Contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: 14, borderRadius: 8, border: "1.5px solid #e63946", fontSize: 18, boxSizing: 'border-box', paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#e63946',
                fontSize: 20,
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? (
                <img src={eyeOn} alt="Ver contraseña" style={{ width: 22, height: 22, filter: 'invert(32%) sepia(99%) saturate(7492%) hue-rotate(340deg) brightness(92%) contrast(98%)' }} />
              ) : (
                <img src={eyeOff} alt="Ocultar contraseña" style={{ width: 22, height: 22, filter: 'invert(32%) sepia(99%) saturate(7492%) hue-rotate(340deg) brightness(92%) contrast(98%)' }} />
              )}
            </button>
          </div>
          {passwordError && <div style={{ color: '#e63946', fontSize: 13, marginTop: 2 }}>{passwordError}</div>}
        </div>
        {error && <div style={{ color: "#e63946", marginBottom: 12, textAlign: "center" }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", background: "#e63946", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 18, fontFamily: "Chewy, system-ui", fontWeight: 600, cursor: "pointer", marginTop: 12 }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
