export type Message = {
  fileUrl?: string; 
  id: string;
  hasLanguagePending?: boolean;
  hasTranscriptionPending?: boolean;
  language?: string;
  text?: string 
};
