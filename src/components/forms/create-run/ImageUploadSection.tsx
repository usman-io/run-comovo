
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./FormSchema";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageUploadSectionProps {
  form: UseFormReturn<FormValues>;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setSelectedImageFile: (file: File | null) => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ 
  form, 
  imagePreview, 
  setImagePreview, 
  setSelectedImageFile 
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the actual file for upload
      setSelectedImageFile(file);
      
      // Create preview for UI
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("imageUrl", file.name); // Just store filename for form validation
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    form.setValue("imageUrl", "");
    
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <FormField
      control={form.control}
      name="imageUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Run Image</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center space-y-4">
              <div 
                className={`border-2 border-dashed rounded-md w-full max-w-sm mx-auto cursor-pointer overflow-hidden 
                  ${imagePreview ? 'border-primary' : 'border-gray-300 hover:border-primary'}`}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <AspectRatio ratio={4/5} className="w-full">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Run preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Image className="h-12 w-12 mb-2" />
                      <p>Click to upload an image</p>
                      <p className="text-xs text-gray-500 mt-1">Recommended: 1080 × 1350px (4:5)</p>
                    </div>
                  )}
                </AspectRatio>
              </div>
              <input 
                type="file" 
                id="image-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
              {imagePreview && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </Button>
              )}
            </div>
          </FormControl>
          <FormDescription>
            Upload a portrait image for your run (4:5 aspect ratio, optional)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageUploadSection;
