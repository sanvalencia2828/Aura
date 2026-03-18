"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image, Download, Loader2, Check } from "lucide-react";

interface ProcessedImage {
  base64: string;
  width: number;
  height: number;
}

interface ProcessedFormats {
  square: ProcessedImage;
  story: ProcessedImage;
  landscape: ProcessedImage;
}

interface ProcessedResult {
  formats: ProcessedFormats;
  original: {
    base64: string;
    size: number;
  };
}

interface ImageUploaderProps {
  onImagesProcessed?: (images: ProcessedFormats) => void;
  compact?: boolean;
}

const formatLabels = {
  square: { name: "Cuadrado", size: "1080×1080" },
  story: { name: "Historia", size: "1080×1920" },
  landscape: { name: "Landscape", size: "1200×630" },
};

export default function ImageUploader({ onImagesProcessed, compact = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    } else {
      setError("Por favor, selecciona un archivo de imagen válido.");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo es demasiado grande. Máximo 10MB.");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setProcessedResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al procesar la imagen");
      }

      const data = await response.json();
      setProcessedResult(data);
      if (onImagesProcessed) {
        onImagesProcessed(data.formats);
      }
    } catch (err) {
      setError("Error al procesar la imagen. Intenta de nuevo.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64}`;
    link.download = filename;
    link.click();
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setProcessedResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${isDragging 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : selectedFile 
              ? "border-border bg-surface/50 cursor-default" 
              : "border-border hover:border-primary/50 hover:bg-surface/30"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Arrastra tu imagen aquí
            </h3>
            <p className="text-zinc-400 mb-4">
              o haz clic para seleccionar un archivo
            </p>
            <p className="text-sm text-zinc-500">
              PNG, JPG, WEBP • Máximo 10MB
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="relative mx-auto mb-6">
              <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border border-border">
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>

            {!processedResult && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={isProcessing}
                className="px-8 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-medium
                  hover:opacity-90 transition-all duration-200 disabled:opacity-50
                  flex items-center gap-2 mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Image className="w-5 h-5" />
                    Procesar Imagen
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center animate-fade-in">
          {error}
        </div>
      )}

      {processedResult && (
        <div className="mt-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold">Imágenes generadas exitosamente</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(formatLabels) as Array<keyof typeof formatLabels>).map((format) => {
              const label = formatLabels[format];
              const image = processedResult.formats[format];

              return (
                <div
                  key={format}
                  className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300"
                >
                  <div 
                    className="aspect-square relative overflow-hidden bg-zinc-900 cursor-pointer"
                    onClick={() => downloadImage(image.base64, `aura-${format}.png`)}
                  >
                    <img
                      src={`data:image/png;base64,${image.base64}`}
                      alt={label.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Download className="w-4 h-4" />
                        Descargar
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{label.name}</h4>
                        <p className="text-sm text-zinc-500">{label.size}</p>
                      </div>
                      <button
                        onClick={() => downloadImage(image.base64, `aura-${format}.png`)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetUpload}
            className="mt-8 w-full py-3 border border-border rounded-xl hover:border-primary/50 transition-colors text-zinc-400 hover:text-white"
          >
            Procesar otra imagen
          </button>
        </div>
      )}
    </div>
  );
}
