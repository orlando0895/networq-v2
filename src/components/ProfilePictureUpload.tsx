import React, { useState, useRef } from 'react';
import { Camera, Upload, X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  userInitials: string;
  variant?: 'avatar' | 'companyLogo';
  compact?: boolean;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentAvatarUrl,
  onAvatarUpdate,
  userInitials,
  variant = 'avatar',
  compact = false
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const openFilePicker = () => fileInputRef.current?.click();
  const label = variant === 'companyLogo' ? 'Company logo' : 'Profile picture';
  
  // Use compact mode on mobile or when explicitly requested
  const useCompactMode = compact || isMobile;

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create file path
      const fileExt = file.name.split('.').pop();
      const baseName = variant === 'companyLogo' ? 'company-logo' : 'avatar';
      const fileName = `${user.id}/${baseName}.${fileExt}`;
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      onAvatarUpdate(data.publicUrl);
      
      toast({
        title: `${label} updated`,
        description: `Your ${label.toLowerCase()} has been uploaded successfully.`
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${label.toLowerCase()}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    uploadAvatar(file);
  };

  const removeAvatar = () => {
    onAvatarUpdate(null);
    toast({
      title: `${label} removed`,
      description: `Your ${label.toLowerCase()} has been removed.`
    });
  };

  if (useCompactMode) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative group">
          <Avatar className="h-12 w-12">
            <AvatarImage src={currentAvatarUrl || undefined} />
            <AvatarFallback className="text-sm font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          <div
            className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={openFilePicker}
            role="button"
            aria-label="Change image"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFilePicker();
              }
            }}
          >
            <Camera className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{userInitials}</p>
          <p className="text-xs text-muted-foreground">
            {currentAvatarUrl ? 'Tap to change' : 'No image'}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={uploading}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openFilePicker} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </DropdownMenuItem>
            {currentAvatarUrl && (
              <DropdownMenuItem onClick={removeAvatar}>
                <X className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentAvatarUrl || undefined} />
          <AvatarFallback className="text-lg font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        <div
          className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={openFilePicker}
          role="button"
          aria-label="Change image"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFilePicker();
            }
          }}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="w-full flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={openFilePicker}
          className="w-full sm:w-auto"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        
        {currentAvatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={removeAvatar}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};