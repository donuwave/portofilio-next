export type ContactRequest = {
  id: string;
  name: string;
  contact: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type ContactRequestInput = Pick<ContactRequest, "name" | "contact" | "message"> & { website?: string };
