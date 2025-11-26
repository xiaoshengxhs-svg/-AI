export enum MediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO'
}

export interface ProcessState {
  status: 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
  error?: string;
  originalUrl?: string;
  processedUrl?: string;
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  base64?: string;
}
