
import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import AlumnosCRUD from "./components/AlumnosCRUD";
import MaestrosCRUD from "./components/MaestrosCRUD";
import TutoresCRUD from "./components/TutoresCRUD";
import HorariosCRUD from "./components/HorariosCRUD";
import ClasesCRUD from "./components/ClasesCRUD";
import JustificacionesCRUD from "./components/JustificacionesCRUD";
import PasesSalidaCRUD from "./components/PasesSalidaCRUD";
import ScannerIntegration from "./components/ScannerIntegration.jsx";
import Reportes from "./components/Reportes";
import SummaryCards from "./components/SummaryCards";
import RegistroAsistencia from "./components/RegistroAsistencia";

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const AUTH_TOKEN_PREFIX = 'Token '; // Intenta con 'Token ' (común con Knox/DRF TokenAuth) o 'Bearer '

export default function App() {
  const [token, setToken] = useState("");
  const [menu, setMenu] = useState("dashboard");
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [username, setUsername] = useState("");
  const [userAvatar, setUserAvatar] = useState(""); // Default: /avatar.png
  const [userRole, setUserRole] = useState("");
  const [loginKey, setLoginKey] = useState(Date.now());

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    const savedUserAvatar = localStorage.getItem("userAvatar");
    const savedUserRole = localStorage.getItem("userRole");
    
    if ((savedToken && !savedUserRole) || (!savedToken && savedUserRole)) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("userRole");
      setToken("");
      setUsername("");
      setUserAvatar("");
      setUserRole("");
      return;
    }
    if (savedToken) setToken(savedToken);
    if (savedUsername) setUsername(savedUsername);
    if (savedUserAvatar) setUserAvatar(savedUserAvatar);
    if (savedUserRole) setUserRole(savedUserRole);
  }, []);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "info" }), 3000);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `${AUTH_TOKEN_PREFIX}${token}`,
            'Content-Type': 'application/json',
          },
        });
        // Aunque la API falle o no haga nada, procedemos con el logout del cliente
      } catch (error) {
        console.error("Error durante el logout en la API:", error);
        // No bloqueamos el logout del cliente si la API falla
      }
    }

    setToken("");
    setUsername("");
    setUserAvatar("");
    setUserRole("");
    setMenu("dashboard"); 
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("userRole");
    setLoginKey(Date.now()); 
    showMessage("Sesión cerrada.", "info");
  };

  const handleUnauthorized = () => {
    showMessage("Tu sesión ha expirado o no es válida. Por favor, inicia sesión de nuevo.", "error");
    handleLogout(); // Reutilizamos handleLogout para limpiar todo
  };

  const handleLoginSuccess = (apiToken, apiUsername, apiUserRole, apiUserAvatar) => {
    const avatar = apiUserAvatar || "/avatar.png"; 
    setToken(apiToken);
    setUsername(apiUsername);
    setUserAvatar(avatar);
    setUserRole(apiUserRole);
    localStorage.setItem("token", apiToken);
    localStorage.setItem("username", apiUsername);
    localStorage.setItem("userAvatar", avatar);
    localStorage.setItem("userRole", apiUserRole);
    showMessage("¡Bienvenido!", "success");
    setMenu("dashboard");
  };

  const handleScannedData = (data) => {
    console.log("Data scanned in App.jsx:", data);
  };

  const isLoggedIn = !!token;

  let ContentComponent;
  if (isLoggedIn) {
    switch (menu) {
      case "dashboard":
        ContentComponent = <Dashboard token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "alumnos":
        ContentComponent = <AlumnosCRUD token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "maestros":
        ContentComponent = <MaestrosCRUD token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "tutores":
        ContentComponent = <TutoresCRUD token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "horarios":
        ContentComponent = <HorariosCRUD token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "clases":
        ContentComponent = <ClasesCRUD token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "justificaciones":
        ContentComponent = <JustificacionesCRUD token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "pases":
        ContentComponent = <PasesSalidaCRUD token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "asistencias":
        ContentComponent = <ScannerIntegration 
                              onScanSuccess={handleScannedData} 
                              token={token} 
                              showMessage={showMessage} 
                              onUnauthorized={handleUnauthorized} 
                              authTokenPrefix={AUTH_TOKEN_PREFIX}
                            />;
        break;
      case "registro-asistencia": 
        ContentComponent = <RegistroAsistencia 
                              token={token} 
                              showMessage={showMessage} 
                              onUnauthorized={handleUnauthorized} 
                              authTokenPrefix={AUTH_TOKEN_PREFIX}
                            />;
        break;
      case "reportes":
        ContentComponent = <Reportes token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      case "resumen":
        ContentComponent = <SummaryCards token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
        break;
      default:
        ContentComponent = <Dashboard token={token} showMessage={showMessage} onUnauthorized={handleUnauthorized} authTokenPrefix={AUTH_TOKEN_PREFIX} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100"> 
      {message.text && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50
            ${message.type === "success" ? "bg-emerald-500 text-white" : ""}
            ${message.type === "error" ? "bg-red-500 text-white" : ""}
            ${message.type === "info" ? "bg-sky-500 text-white" : ""}`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {!isLoggedIn ? (
        <LoginPage
          key={loginKey}
          onLoginSuccess={handleLoginSuccess}
          showMessage={showMessage}
        />
      ) : (
        <div className="flex flex-1">
          <Sidebar menu={menu} setMenu={setMenu} onLogout={handleLogout} userRole={userRole} />
          <div className="flex-1 flex flex-col">
            <Header username={username} userAvatar={userAvatar || "/avatar.png"} menu={menu} />
            <main className="flex-1 p-6"> 
              {ContentComponent}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
