import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface CustomFonts {
  primary: string;
  secondary: string;
}

interface NutritionistUser {
  id: string;
  name: string;
  email: string;
  customColors?: CustomColors;
  customFonts?: CustomFonts;
  logoUrl?: string;
  // outros campos se necessário
}

interface NutritionistSettings {
  customColors?: CustomColors;
  customFonts?: CustomFonts;
  logoUrl?: string;
}

interface NutritionistSettingsContextData {
  settings: NutritionistSettings;
  updateSettings: (newSettings: NutritionistSettings) => void;
}

const NutritionistSettingsContext =
  createContext<NutritionistSettingsContextData>(
    {} as NutritionistSettingsContextData
  );

export const NutritionistSettingsProvider: React.FC<{
  user: NutritionistUser | null;
  children: React.ReactNode;
}> = ({ user, children }) => {
  const [settings, setSettings] = useState<NutritionistSettings>(() => {
    if (user) {
      return {
        customColors: user.customColors,
        customFonts: user.customFonts,
        logoUrl: user.logoUrl,
      };
    }
    return {};
  });

  useEffect(() => {
    if (user) {
      setSettings({
        customColors: user.customColors,
        customFonts: user.customFonts,
        logoUrl: user.logoUrl,
      });
    } else {
      setSettings({});
    }
  }, [user?.id, user?.customColors, user?.customFonts, user?.logoUrl]);

  const updateSettings = React.useCallback(
    (newSettings: NutritionistSettings) => {
      setSettings(newSettings);
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      settings,
      updateSettings,
    }),
    [settings, updateSettings]
  );

  return (
    <NutritionistSettingsContext.Provider value={contextValue}>
      {children}
    </NutritionistSettingsContext.Provider>
  );
};

export const useNutritionistSettings = () => {
  const context = useContext(NutritionistSettingsContext);

  if (!context) {
    throw new Error(
      "useNutritionistSettings must be used within a NutritionistSettingsProvider"
    );
  }

  return context;
};
