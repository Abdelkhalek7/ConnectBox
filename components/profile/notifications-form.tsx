"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true).optional(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export function NotificationsForm() {
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
    },
  });

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          form.reset({
            emailNotifications: data.notifications !== null ? data.notifications : true,
          });
        }
      } catch (err) {
        console.error("Failed to load notifications settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifications();
  }, [form]);

  async function onSubmit(data: NotificationsFormValues) {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: data.emailNotifications,
        }),
      });
      if (res.ok) {
        toast({
          title: "Notification settings updated",
          description: "Your notification preferences have been saved successfully.",
        });
      } else {
        throw new Error("Failed to update notifications");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not save notification settings.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading notifications...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Notifications</FormLabel>
                <FormDescription>
                  Receive email notifications for important updates.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Update notifications</Button>
      </form>
    </Form>
  );
}
