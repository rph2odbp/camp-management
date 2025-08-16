export interface GalleryPhoto {
    url: string;
    caption?: string;
    uploadedAt: string;
  }
  
  export interface Gallery {
    id: string;
    sessionId: string;
    year: number;
    title: string;
    photos: GalleryPhoto[];
    externalProvider?: "dropbox" | "firebase_storage" | "google_photos";
    externalUrl?: string;
    visibleTo: ("parent" | "admin" | "staff")[];
    customFields?: Record<string, any>;
  }