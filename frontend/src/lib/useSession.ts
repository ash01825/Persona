"use client";

import { useState, useEffect } from "react";

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Generate UUID v4
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    let storedId = localStorage.getItem("persona_session_id");
    if (!storedId) {
      storedId = generateUUID();
      localStorage.setItem("persona_session_id", storedId);
    }
    setSessionId(storedId);
  }, []);

  return sessionId;
}
