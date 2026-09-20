"use client";

import { useEffect, useState } from "react";
import { fetchMediaList, type MediaListParams, type MediaListResult } from "../api/media-api";

type ListState = {
  key: string;
  data: MediaListResult | null;
  error: string | null;
};

export function useMediaList(params: MediaListParams) {
  const [reloadToken, setReloadToken] = useState(0);
  const paramsKey = JSON.stringify(params);
  const requestKey = `${paramsKey}:${reloadToken}`;

  const [state, setState] = useState<ListState>({ key: requestKey, data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    fetchMediaList(JSON.parse(paramsKey) as MediaListParams)
      .then((result) => {
        if (!cancelled) setState({ key: requestKey, data: result, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            key: requestKey,
            data: null,
            error: err instanceof Error ? err.message : "Не удалось загрузить файлы",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paramsKey, requestKey]);

  // Derived during render (not via effect setState): true whenever the in-flight
  // request's key hasn't caught up with the latest params/reload yet.
  const isLoading = state.key !== requestKey;

  return { data: state.data, isLoading, error: state.error, reload: () => setReloadToken((t) => t + 1) };
}
