import { parseSender } from "@/lib/parseSender";

export const getEmailsAPI = async (sessiontoken: string, category: string) => {
  const response = await fetch("/api/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: sessiontoken,
      category,
    }),
  });
  const data = await response.json().then((emails) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emails.map((email: any) => ({
      id: email.id,
      name: parseSender(email.from!).name,
      email: parseSender(email.from!).email,
      subject: email.subject!,
      date: email.date!,
      text: email.decodedBody!,
      labels: email.labelIds!,
      read: !email.labelIds!.includes("UNREAD"),
      snippet: email.snippet!,
    })),
  );

  console.log("getEmailsAPI data", data);
  return data;
};
