import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCardScannerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onContactExtracted: (contactInfo: any) => void;
}

const BusinessCardScanner = ({ isOpen, onOpenChange, onContactExtracted }: BusinessCardScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this device');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera stream acquired:', stream);
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Camera access error:', error);
      
      let errorMessage = "Could not access camera. Please try uploading an image instead.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = "Camera permission denied. Please allow camera access and try again.";
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = "No camera found on this device. Please try uploading an image instead.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Camera is not supported on this device. Please try uploading an image instead.";
        }
      }
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Effect to attach camera stream to video element when camera is shown
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      console.log('Attaching stream to video element...');
      const video = videoRef.current;
      
      video.srcObject = cameraStream;
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded, attempting to play...');
        video.play().then(() => {
          console.log('Video is now playing');
        }).catch((playError) => {
          console.error('Error playing video:', playError);
        });
      };
    }
  }, [showCamera, cameraStream]);

  // Cleanup effect for camera stream
  useEffect(() => {
    return () => {
      if (cameraStream) {
        console.log('Cleaning up camera stream...');
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Set reasonable dimensions to avoid oversized images
    const maxWidth = 1024;
    const maxHeight = 768;
    
    let { videoWidth, videoHeight } = video;
    
    // Scale down if too large
    if (videoWidth > maxWidth || videoHeight > maxHeight) {
      const ratio = Math.min(maxWidth / videoWidth, maxHeight / videoHeight);
      videoWidth *= ratio;
      videoHeight *= ratio;
    }
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      // Use JPEG with quality 0.7 to reduce file size
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      stopCamera();
      processImage(imageData);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Create an image element to resize if needed
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Set max dimensions
      const maxWidth = 1024;
      const maxHeight = 768;
      
      let { width, height } = img;
      
      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      processImage(imageData);
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageData: string) => {
    setIsScanning(true);
    console.log('Starting business card processing...');
    console.log('Image data starts with:', imageData.substring(0, 50));
    console.log('Image data length:', imageData.length);
    
    try {
      // Validate image data format
      if (!imageData.startsWith('data:image/')) {
        throw new Error('Invalid image data format');
      }
      
      console.log('Calling scan-business-card function...');
      
      const { data: functionData, error } = await supabase.functions.invoke('scan-business-card', {
        body: { imageData }
      });

      console.log('Function response data:', functionData);
      console.log('Function error:', error);
      
      if (error) {
        console.error('Function call failed:', error);
        throw new Error(`Function call failed: ${error.message}`);
      }

      if (functionData?.success && functionData?.contactInfo) {
        console.log('Successfully extracted contact info:', functionData.contactInfo);
        onContactExtracted(functionData.contactInfo);
        onOpenChange(false);
        toast({
          title: "Success!",
          description: "Business card information extracted successfully."
        });
      } else {
        console.error('Function returned error or no data:', functionData);
        const errorMessage = functionData?.error || 'Failed to extract information from business card';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error processing business card:', error);
      
      // More specific error messages
      let errorMessage = "Could not extract information from the business card. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Function call failed')) {
          errorMessage = "Service temporarily unavailable. Please try again in a moment.";
        } else if (error.message.includes('Invalid image data')) {
          errorMessage = "Invalid image format. Please try a different image.";
        } else if (error.message.includes('No response data')) {
          errorMessage = "Service error. Please check your connection and try again.";
        }
      }
      
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Business Card
          </DialogTitle>
          <DialogDescription>
            Extract contact information from business cards by taking a photo or uploading an image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isScanning && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Processing business card...</p>
              </div>
            </div>
          )}

          {!isScanning && !showCamera && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={startCamera} 
                  className="flex items-center gap-2 h-12"
                >
                  <Camera className="w-5 h-5" />
                  Take Photo
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 h-12"
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <p className="text-sm text-muted-foreground text-center">
                Take a clear photo of the business card or upload an existing image
              </p>
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg bg-black min-h-[300px]"
                  style={{ objectFit: 'cover' }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessCardScanner;