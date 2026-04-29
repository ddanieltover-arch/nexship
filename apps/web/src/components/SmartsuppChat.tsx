"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

declare global {
  interface Window {
    _smartsupp: any;
    smartsupp: any;
  }
}

export function SmartsuppChat() {
  const pathname = usePathname();
  const { user } = useAuth();
  const key = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;

  useEffect(() => {
    if (!key) {
      console.warn("Smartsupp key is missing. Please set NEXT_PUBLIC_SMARTSUPP_KEY in your environment variables.");
      return;
    }

    // Initialize Smartsupp loader
    if (!window.smartsupp) {
      window._smartsupp = window._smartsupp || {};
      window._smartsupp.key = key;
      
      const o = function() {
        (o as any).q = (o as any).q || [];
        (o as any).q.push(arguments);
      };
      (o as any).q = [];
      window.smartsupp = o;

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.charset = "utf-8";
      script.src = "https://www.smartsuppchat.com/loader.js?";
      document.head.appendChild(script);
    }

    const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";
    const isAdminPage = pathname?.startsWith("/admin");

    if (isAdmin || isAdminPage) {
      window.smartsupp("chat:hide");
    } else {
      window.smartsupp("chat:show");
    }

    // Positioning logic to avoid blocking MobileDock
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      window.smartsupp('options', {
        accentColor: '#06b6d4',
        offsetVertical: isMobile ? 100 : 20,
        offsetHorizontal: 20
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [key, pathname, user]);

  return null;
}
