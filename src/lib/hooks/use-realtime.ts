"use client";

import { useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useRealtime(_table: string, _onUpdate: (payload: unknown) => void) {
  // No-op: pages re-fetch after every mutation; polling via useMultiRealtime
}

export function useMultiRealtime(
  _tables: string[],
  onUpdate: () => void
) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const id = setInterval(() => callbackRef.current(), 5000);
    return () => clearInterval(id);
  }, []);
}
