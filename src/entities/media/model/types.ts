export type MediaType = "image" | "video";

export type Media = {
  id: string;
  type: MediaType;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: string;
};
