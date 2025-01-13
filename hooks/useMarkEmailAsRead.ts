import { markEmailAsReadAPI } from "@/apis/markEmailAsReadAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Email {
  id: string;
  read: boolean;
  labelIds: string[];
}

export const useMarkEmailAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      session,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      selectedCategory,
    }: {
      messageId: string;
      session: any; // eslint-disable-line @typescript-eslint/no-explicit-any
      selectedCategory: string; // Ensure this matches the destructuring
    }) => {
      try {
        console.log("Calling markEmailAsReadAPI...");
        const response = await markEmailAsReadAPI(
          messageId,
          session.accessToken,
        );
        console.log("API Response:", response);
        return response;
      } catch (error) {
        console.error("Error in markEmailAsReadAPI:", error);
        throw error;
      }
    },
    onMutate: async ({
      messageId,
      session,
      selectedCategory,
    }: {
      messageId: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session: any;
      selectedCategory: string;
    }) => {
      // Cancel any outgoing refetches for emails
      await queryClient.cancelQueries({
        queryKey: ["emails", session.user.id, selectedCategory],
      });

      // Snapshot the previous value
      const previousEmails = queryClient.getQueryData<Email[]>([
        "emails",
        session.user.id,
        selectedCategory,
      ]);

      // Optimistically update to mark the email as read
      if (previousEmails) {
        queryClient.setQueryData<Email[]>(
          ["emails", session.user.id, selectedCategory],
          (old) =>
            old?.map((email) =>
              email.id === messageId
                ? {
                    ...email,
                    read: true,
                    // labelIds: email.labelIds.filter((l) => l !== "UNREAD"),
                  }
                : email,
            ),
        );
      }

      // Return a context object with the previous value
      return { previousEmails };
    },
    // onError: (err, variables, context) => {
    //   // Revert to the previous state
    //   if (context?.previousEmails) {
    //     queryClient.setQueryData(
    //       ["emails", variables.session.user.id, variables.selectedCategory],
    //       context.previousEmails,
    //     );
    //   }
    // },
  });
};
