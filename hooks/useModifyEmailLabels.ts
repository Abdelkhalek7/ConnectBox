import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useModifyEmailLabels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      session,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      selectedCategory,
      addLabelIds = [],
      removeLabelIds = [],
    }: {
      messageId: string;
      session: any; // eslint-disable-line @typescript-eslint/no-explicit-any
      selectedCategory: string;
      addLabelIds?: string[];
      removeLabelIds?: string[];
    }) => {
      try {
        console.log("Calling modifyEmailLabels API...");
        const response = await fetch("/api/email/modify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
            accessToken: session.accessToken,
            addLabelIds,
            removeLabelIds,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to modify labels");
        }

        const data = await response.json();
        console.log("API Response:", data);
        return data;
      } catch (error) {
        console.error("Error in useModifyEmailLabels:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate the query key so the list and counts refetch automatically
      queryClient.invalidateQueries({
        queryKey: ["emails", variables.session.user.id, variables.selectedCategory],
      });
      queryClient.invalidateQueries({
        queryKey: ["labelsCounts", variables.session.user.id],
      });
    },
  });
};
