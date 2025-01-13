export const markEmailAsReadAPI = async (
  messageId: string,
  sessiontoken: string,
) => {
  console.log("markEmailAsReadAPI messageId", messageId);
  const response = await fetch("/api/email/markEmailAsRead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: sessiontoken,
      messageId,
    }),
  });
  const data = await response.json();
  console.log("markEmailAsReadAPI data", data);
  return data;
};
