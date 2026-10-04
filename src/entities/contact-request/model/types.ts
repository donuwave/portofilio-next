export type ContactRequest = {
  id: string;
  name: string;
  contact: string;
  message: string;
  read: boolean;
  consentAt: string | null;
  createdAt: string;
};

export type ContactRequestInput = Pick<ContactRequest, "name" | "contact" | "message"> & { consent: true; website?: string };
