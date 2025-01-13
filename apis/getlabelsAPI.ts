export const getLabelsAPI = async (sessiontoken: string) => {
  const response = await fetch("/api/email/labels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: sessiontoken, // Replace with a valid token
    }),
  });
  const data = await response.json().then((counts) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group1: counts.group1.map((label: any) => ({
      ...label,
      unreadcount: label.unreadcount ?? false,
      variant: label.variant as "default" | "ghost",
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group2: counts.group2.map((label: any) => ({
      ...label,
      unreadcount: label.unreadcount ?? false,
      variant: label.variant as "default" | "ghost",
    })),
  }));
  return {
    group1: data.group1 || [],
    group2: data.group2 || [],
  };
};
