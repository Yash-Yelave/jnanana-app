"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const apiCache = new Map<string, any>();

export function clearApiCache(path?: string) {
  if (path) {
    apiCache.delete(path);
  } else {
    apiCache.clear();
  }
}

export function useApi<T>(path: string) {
  const cached = apiCache.get(path) as T | undefined;
  const [data, setData] = useState<T | undefined>(cached);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(!cached);

  const load = useCallback(async () => {
    try {
      apiCache.delete(path);
      const result = await apiFetch<T>(path);
      apiCache.set(path, result);
      setData(result);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    let active = true;
    if (!apiCache.has(path)) {
      setLoading(true);
    }
    void apiFetch<T>(path)
      .then((result) => {
        if (active) {
          apiCache.set(path, result);
          setData(result);
          setError("");
        }
      })
      .catch((reason: unknown) => {
        if (active && !apiCache.has(path)) {
          setError(reason instanceof Error ? reason.message : "Unable to load data");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [path]);

  return { data, error, loading, reload: load };
}
