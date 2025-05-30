import React, { useState } from "react";
import api from "./api";
import "./App.css";
import logo from './assets/logoLetrasRojo.png';
import logoSolo from './assets/logo.png';
import eyeOff from './assets/proicons--eye-off.svg';
import eyeOn from './assets/proicons--eye.svg';
import { validarEmail, validarPassword, validarNombre } from './utils/validaciones';
import { ERRORES } from './utils/errores';
import { EXITOS } from './utils/exitos';

export default function RegisterPage({ onRegister }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [nombreError, setNombreError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState("/src/assets/fotoperfil/Captura de pantalla 2025-03-09 163338.png");
  const mensajeTimeoutRef = React.useRef();

  React.useEffect(() => {
    if (mensaje) {
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
      mensajeTimeoutRef.current = setTimeout(() => setMensaje(""), 5000);
    }
    return () => {
      if (mensajeTimeoutRef.current) clearTimeout(mensajeTimeoutRef.current);
    };
  }, [mensaje]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNombreError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setCheckboxError("");
    let hasError = false;
    if (!validarNombre(nombre)) {
      setNombreError(ERRORES.nombre);
      hasError = true;
    }
    if (!validarEmail(email)) {
      setEmailError(ERRORES.email);
      hasError = true;
    }
    if (!validarPassword(password)) {
      setPasswordError(ERRORES.password);
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(ERRORES.confirmPassword);
      hasError = true;
    }
    if (!aceptaTerminos || !aceptaPrivacidad) {
      setCheckboxError(ERRORES.checkbox);
      hasError = true;
    }
    if (hasError) return;
    setLoading(true);
    try {
      const fotoPerfilNombre = fotoPerfil.startsWith('/src/assets/fotoperfil/') ? fotoPerfil.replace('/src/assets/fotoperfil/', '') : fotoPerfil;
      const res = await api.post("/users", { nombre, email, password, rol: "cliente", fotoPerfil: fotoPerfilNombre });
      setLoading(false);
      setShowSuccessModal(true);
      setMensaje("");
      setPendingUser(res.data);
    } catch (err) {
      setLoading(false);
      if (err.response?.data?.error?.toLowerCase().includes('email')) {
        setEmailError(ERRORES.emailRepetido);
      } else {
        setError(err.response?.data?.error || ERRORES.crearCuenta);
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
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '32px 36px',
            minWidth: 320,
            maxWidth: 420,
            boxShadow: '0 8px 32px rgba(67,160,71,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24
          }}>
            <div style={{ color: '#43a047', fontFamily: 'Chewy, system-ui', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center' }}>
              {EXITOS.cuentaCreada.split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}<br/></React.Fragment>
              ))}
            </div>
            <button onClick={() => {
              setShowSuccessModal(false);
              if (pendingUser && onRegister) {
                onRegister(pendingUser);
                setPendingUser(null);
              }
            }} style={{
              background: '#43a047',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 32px',
              fontFamily: 'Chewy, system-ui',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(67,160,71,0.10)'
            }}>Aceptar</button>
          </div>
        </div>
      )}
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
      <form onSubmit={handleSubmit} className="login-form" style={{ background: "#fff", padding: 36, borderRadius: 16, boxShadow: "0 4px 24px #e6394633", minWidth: 440, maxWidth: 520, zIndex: 2, position: 'relative', width: 440 }}>
        <h2 style={{ color: "#e63946", fontFamily: "Chewy, system-ui", textAlign: "center", marginBottom: 24 }}>Crear cuenta</h2>
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <a href="/login" style={{ color: "#457b9d", textDecoration: "underline", fontFamily: 'Chewy, system-ui' }}>¿Ya tienes cuenta? Inicia sesión</a>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, display: 'block', color: '#222', letterSpacing: 0.2, fontFamily: 'Chewy, system-ui' }}>
            Elige tu foto de perfil
          </label>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              '/src/assets/fotoperfil/Captura de pantalla 2025-03-09 163338.png',
              '/src/assets/fotoperfil/Captura de pantalla 2025-03-09 163352.png',
              '/src/assets/fotoperfil/Captura de pantalla 2025-03-09 163358.png',
              '/src/assets/fotoperfil/Captura de pantalla 2025-03-09 163402.png',
              '/src/assets/fotoperfil/Captura de pantalla 2025-03-09 163409.png',
              '/src/assets/fotoperfil/Captura de pantalla 2025-03-09 163416.png',
            ].map(foto => (
              <img
                key={foto}
                src={foto}
                alt="foto perfil"
                onClick={() => setFotoPerfil(foto)}
                style={{
                  width: 54,
                  height: 54,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: fotoPerfil === foto ? '3px solid #e63946' : '2px solid #ccc',
                  cursor: 'pointer',
                  boxShadow: fotoPerfil === foto ? '0 0 0 2px #e6394633' : 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  background: '#fff',
                }}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#888' }}>
            Puedes cambiarla más tarde en tu perfil
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, display: 'block', color: '#222', letterSpacing: 0.2, fontFamily: 'Chewy, system-ui' }}>
            Nombre <span style={{ color: '#e63946' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            minLength={2}
            style={{ width: "100%", padding: 14, borderRadius: 8, border: "1.5px solid #e63946", fontSize: 18, boxSizing: 'border-box' }}
          />
          {nombreError && <div style={{ color: '#e63946', fontSize: 13, marginTop: 2 }}>{nombreError}</div>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, display: 'block', color: '#222', letterSpacing: 0.2, fontFamily: 'Chewy, system-ui' }}>
            Email <span style={{ color: '#e63946' }}>*</span>
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
          <label style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, display: 'block', color: '#222', letterSpacing: 0.2, fontFamily: 'Chewy, system-ui' }}>
            Contraseña <span style={{ color: '#e63946' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={7}
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
          <div style={{ width: '100%', display: 'flex', gap: 6, margin: '8px 0 2px 0', height: 7 }}>
            {(() => {
              const pwd = password || "";
              const checks = [
                /[A-Z]/.test(pwd),
                /\d/.test(pwd),
                /[^A-Za-z0-9]/.test(pwd),
                pwd.length >= 7
              ];
              const passed = checks.filter(Boolean).length;
              return [0,1,2,3].map(i => (
                <div key={i} style={{
                  flex: 1,
                  height: 7,
                  borderRadius: 4,
                  background: i < passed ? '#43b96a' : '#e0e0e0',
                  transition: 'background 0.2s',
                }} />
              ));
            })()}
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            Mínimo 7 caracteres, al menos una mayúscula, un número y un símbolo.
          </div>
          {passwordError && <div style={{ color: '#e63946', fontSize: 13, marginTop: 2 }}>{passwordError}</div>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, display: 'block', color: '#222', letterSpacing: 0.2, fontFamily: 'Chewy, system-ui' }}>
            Confirmar contraseña <span style={{ color: '#e63946' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: 14, borderRadius: 8, border: "1.5px solid #e63946", fontSize: 18, boxSizing: 'border-box', paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(v => !v)}
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
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showConfirmPassword ? (
                <img src={eyeOn} alt="Ver contraseña" style={{ width: 22, height: 22, filter: 'invert(32%) sepia(99%) saturate(7492%) hue-rotate(340deg) brightness(92%) contrast(98%)' }} />
              ) : (
                <img src={eyeOff} alt="Ocultar contraseña" style={{ width: 22, height: 22, filter: 'invert(32%) sepia(99%) saturate(7492%) hue-rotate(340deg) brightness(92%) contrast(98%)' }} />
              )}
            </button>
          </div>
          {confirmPasswordError && <div style={{ color: '#e63946', fontSize: 13, marginTop: 2 }}>{confirmPasswordError}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: 15 }}>
            <input type="checkbox" checked={aceptaTerminos} onChange={e => setAceptaTerminos(e.target.checked)} style={{ marginRight: 8 }} />
            Acepto los <a href="#aviso-legal" style={{ color: '#e63946', marginLeft: 4, marginRight: 4 }} target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: 15 }}>
            <input type="checkbox" checked={aceptaPrivacidad} onChange={e => setAceptaPrivacidad(e.target.checked)} style={{ marginRight: 8 }} />
            Acepto la <a href="#politica-privacidad" style={{ color: '#e63946', marginLeft: 4, marginRight: 4 }} target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
          </label>
          {checkboxError && <div style={{ color: '#e63946', fontSize: 13, marginTop: 2 }}>{checkboxError}</div>}
        </div>
        {error && <div style={{ color: "#e63946", marginBottom: 12, textAlign: "center" }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", background: "#e63946", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 18, fontFamily: "Chewy, system-ui", fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
