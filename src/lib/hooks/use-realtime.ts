"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "bays" | "jobs";

/**
 * Subscribe to Supabase realtime changes on a table.
 * Calls onUpdate whenever the table receives an INSERT, UPDATE, or DELETE event.
 */
export function useRealtime(
  table: TableName,
  onUpdate: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => callbackRef.current(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);
}

/**
 * Subscribe to multiple tables at once (staff/owner dashboards).
 */
export function useMultiRealtime(
  tables: TableName[],
  onUpdate: () => void
) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  const tablesKey = tables.join(",");

  useEffect(() => {
    const channel = supabase.channel(`multi-${tablesKey}-${Date.now()}`);

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => callbackRef.current()
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesKey]);
}
