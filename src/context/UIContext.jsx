import { createContext, useState } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <UIContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </UIContext.Provider>
  );
};

export default UIContext;
