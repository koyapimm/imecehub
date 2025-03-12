import React, { useState } from "react";

export default function MediaUpload({ onMediaSelect }) {
  const [error, setError] = useState("");

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Dosya boyutu 5MB'dan büyük olamaz");
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    
    if (!allowedImageTypes.includes(file.type) && !allowedVideoTypes.includes(file.type)) {
      throw new Error("Sadece JPEG, PNG, WEBP, MP4 ve WEBM dosyaları yüklenebilir");
    }

    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.msi', '.js', '.php'];
    if (dangerousExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      throw new Error("Zararlı dosya tespit edildi");
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    if (cleanFileName !== file.name) {
      throw new Error("Dosya adı sadece harf, rakam ve (-_.) karakterlerini içerebilir");
    }
  };

  const handleFileSelect = (e) => {
    try {
      setError("");
      const file = e.target.files[0];
      if (!file) return;

      validateFile(file);

      const actualType = file.type;
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          // Magic number kontrolü
          const arr = new Uint8Array(reader.result).subarray(0, 4);
          const header = Array.from(arr).map(b => b.toString(16)).join('');
          
          // JPEG, PNG, MP4 magic number kontrolü
          const magicNumbers = {
            'image/jpeg': 'ffd8',
            'image/png': '89504e47',
            'video/mp4': '66747970'
          };

          if (magicNumbers[actualType] && !header.startsWith(magicNumbers[actualType])) {
            throw new Error("Dosya içeriği geçersiz");
          }

          onMediaSelect(new File([file], cleanFileName, { type: file.type }));
        } catch (err) {
          setError(err.message);
          e.target.value = '';
        }
      };

      reader.onerror = () => {
        setError("Dosya okunamadı");
        e.target.value = '';
      };

      reader.readAsArrayBuffer(file.slice(0, 4));

    } catch (err) {
      setError(err.message);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-3 md:p-4">
      <h2 className="text-base md:text-lg text-left font-semibold text-gray-900">Medya</h2>
      <p className="text-gray-500 text-left text-xs md:text-sm mt-1">Fotoğraf veya video paylaş.</p>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3">
        <label className="flex items-center justify-center bg-gray-200 px-3 md:px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 text-sm md:text-base">
          📷 Fotoğraf Ekle
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>

        <label className="flex items-center justify-center bg-gray-200 px-3 md:px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 text-sm md:text-base">
          🎥 Video Ekle
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
