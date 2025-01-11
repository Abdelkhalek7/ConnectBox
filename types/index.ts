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

// declare global {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const mongoose: any
//   }
declare global {
  namespace NodeJS {
    interface Global {
      [key: string]: any;
      mongoose?: {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
      };
    }
  }
}
