import React, { createContext, useContext, useState, useEffect } from "react";

interface LogoContextType {
  logoUrl: string;
  updateLogo: (url: string) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const STORAGE_KEY = "@smartnutri:logo";

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    // Tenta recuperar o logo do localStorage ao inicializar
    const storedLogo = localStorage.getItem(STORAGE_KEY);
    return storedLogo || "/images/logo.png";
  });

  // Atualiza o localStorage sempre que o logo mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, logoUrl);
  }, [logoUrl]);

  // Atualiza o logo quando o usuário fizer login
  useEffect(() => {
    const handleUserLogin = () => {
      const user = JSON.parse(localStorage.getItem("@smartnutri:user") || "{}");
      if (user.logoUrl) {
        setLogoUrl(user.logoUrl);
      }
    };

    window.addEventListener("userLogin", handleUserLogin);
    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
    };
  }, []);

  const updateLogo = (url: string) => {
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
