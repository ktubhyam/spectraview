/**
 * Hook for managing spectrum data loading and state.
 *
 * Handles file loading (drag-and-drop, file input), parsing,
 * and managing the collection of loaded spectra.
 */

import { useCallback, useState } from "react";
import type { Spectrum } from "../types";
import { parseCsv } from "../parsers/csv";
import { parseJson } from "../parsers/json";
import { parseJcamp } from "../parsers/jcamp";

export interface UseSpectrumDataReturn {
  /** Currently loaded spectra. */
  spectra: Spectrum[];
  /** Whether a file is currently being loaded. */
  loading: boolean;
  /** Last error message, if any. */
  error: string | null;
  /** Load spectra from a File object (detects format from extension). */
  loadFile: (file: File) => Promise<void>;
  /** Load spectra from a raw text string with explicit format. */
  loadText: (text: string, format: "jcamp" | "csv" | "json") => Promise<void>;
  /** Add a spectrum directly. */
  addSpectrum: (spectrum: Spectrum) => void;
  /** Remove a spectrum by ID. */
  removeSpectrum: (id: string) => void;
  /** Toggle a spectrum's visibility. */
  toggleVisibility: (id: string) => void;
  /** Clear all loaded spectra. */
  clear: () => void;
}

/**
 * Detect file format from file extension.
 */
function detectFormat(filename: string): "jcamp" | "csv" | "json" | null {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "dx":
    case "jdx":
    case "jcamp":
      return "jcamp";
    case "csv":
    case "tsv":
    case "txt":
      return "csv";
    case "json":
      return "json";
    default:
      return null;
  }
}

/**
 * Hook for loading and managing spectral data.
 */
export function useSpectrumData(
  initialSpectra: Spectrum[] = [],
): UseSpectrumDataReturn {
  const [spectra, setSpectra] = useState<Spectrum[]>(initialSpectra);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadText = useCallback(
    async (text: string, format: "jcamp" | "csv" | "json") => {
      setLoading(true);
      setError(null);

      try {
        let parsed: Spectrum[];

        switch (format) {
          case "jcamp":
            parsed = await parseJcamp(text);
            break;
          case "csv":
            parsed = [parseCsv(text)];
            break;
          case "json":
            parsed = parseJson(text);
            break;
        }

        setSpectra((prev) => [...prev, ...parsed]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse file";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadFile = useCallback(
    async (file: File) => {
      const format = detectFormat(file.name);
      if (!format) {
        setError(`Unsupported file format: ${file.name}`);
        return;
      }

      const text = await file.text();
      await loadText(text, format);
    },
    [loadText],
  );

  const addSpectrum = useCallback((spectrum: Spectrum) => {
    setSpectra((prev) => [...prev, spectrum]);
  }, []);

  const removeSpectrum = useCallback((id: string) => {
    setSpectra((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setSpectra((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, visible: s.visible === false ? true : false } : s,
      ),
    );
  }, []);

  const clear = useCallback(() => {
    setSpectra([]);
    setError(null);
  }, []);

  return {
    spectra,
    loading,
    error,
    loadFile,
    loadText,
    addSpectrum,
    removeSpectrum,
    toggleVisibility,
    clear,
  };
}
