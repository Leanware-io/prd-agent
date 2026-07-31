import React, { createContext, useContext, useEffect, useMemo } from "react";

type WindowWithDataLayer = Window & {
  dataLayer: Record<string, any>[];
  gtag(key: string, value: any): void;
};

declare const window: WindowWithDataLayer;

interface IGtagContext {
  gtag: (command: string, ...args: any[]) => void;
}

const GtagContext = createContext<IGtagContext | undefined>(undefined);

interface IGtagProvider {
  children: React.ReactNode;
  gtagId: string;
}

export const GtagProvider = (props: IGtagProvider) => {
  const { children, gtagId } = props;

  useEffect(() => {
    if (gtagId) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", gtagId);
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [gtagId]);

  const gtag = window.gtag;

  const gtagValue = useMemo(() => ({ gtag }), [gtag]);

  return (
    <GtagContext.Provider value={gtagValue}>{children}</GtagContext.Provider>
  );
};

export const useGtag = () => useContext(GtagContext);
