import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
export const LazyBusinessCardScanner = lazy(() => import('@/components/BusinessCardScanner'));
export const LazyQRCodeShare = lazy(() => import('@/components/QRCodeShare').then(module => ({ default: module.QRCodeShare })));
export const LazyProfilePictureUpload = lazy(() => import('@/components/ProfilePictureUpload').then(module => ({ default: module.ProfilePictureUpload })));
export const LazyDeleteAccountDialog = lazy(() => import('@/components/DeleteAccountDialog'));

// Loading fallbacks for each component type
export const ScannerSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="flex gap-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 flex-1" />
    </div>
  </div>
);

export const QRSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-32 mx-auto" />
    <Skeleton className="h-48 w-48 mx-auto rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export const UploadSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-20 w-20 rounded-full mx-auto" />
    <Skeleton className="h-8 w-24 mx-auto" />
  </div>
);

export const DialogSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-10 w-full" />
  </div>
);

// Wrapper components with suspense
export const BusinessCardScanner = (props: any) => (
  <Suspense fallback={<ScannerSkeleton />}>
    <LazyBusinessCardScanner {...props} />
  </Suspense>
);

export const QRCodeShare = (props: any) => (
  <Suspense fallback={<QRSkeleton />}>
    <LazyQRCodeShare {...props} />
  </Suspense>
);

export const ProfilePictureUpload = (props: any) => (
  <Suspense fallback={<UploadSkeleton />}>
    <LazyProfilePictureUpload {...props} />
  </Suspense>
);

export const DeleteAccountDialog = (props: any) => (
  <Suspense fallback={<DialogSkeleton />}>
    <LazyDeleteAccountDialog {...props} />
  </Suspense>
);