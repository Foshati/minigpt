import { Upload } from 'lucide-react';

export function ImageUpload({ onImageUpload }: { onImageUpload: (file: File) => void }) {
  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="image-upload"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
        }}
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer p-2 hover:bg-muted rounded-md"
      >
        <Upload className="w-5 h-5" />
      </label>
    </div>
  );
}