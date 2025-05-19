import React, { createContext, useContext, useState, useEffect } from "react";

interface LogoContextType {
  logoUrl: string | null;
  updateLogo: (url: string | null) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const STORAGE_KEY = "@smartnutri:logo";

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    // Tenta recuperar o logo do localStorage ao inicializar
    const storedLogo = localStorage.getItem(STORAGE_KEY);
    return storedLogo || null;
  });

  // Atualiza o localStorage sempre que o logo mudar
  useEffect(() => {
    if (logoUrl === null) {
      // Se o logo for null, remove do localStorage
      localStorage.removeItem(STORAGE_KEY);
    } else {
      // Se tiver um logo, salva no localStorage
      localStorage.setItem(STORAGE_KEY, logoUrl);
    }
  }, [logoUrl]);

  // Atualiza o logo quando o usuário fizer login
  useEffect(() => {
    const handleUserLogin = () => {
      const user = JSON.parse(localStorage.getItem("@smartnutri:user") || "{}");
      if (user.logoUrl) {
        setLogoUrl(user.logoUrl);
      } else {
        setLogoUrl(null);
      }
    };

    window.addEventListener("userLogin", handleUserLogin);
    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
    };
  }, []);

  const updateLogo = (url: string | null) => {
    setLogoUrl(url);
  };

  return (
    <LogoContext.Provider value={{ logoUrl, updateLogo }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error("useLogo must be used within a LogoProvider");
  }
  return context;
}
