/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-var */
export interface Mail {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  date: string;
  read: boolean;
  labels: string[];
  snippet: string;
}
