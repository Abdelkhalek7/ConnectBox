/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Paperclip, X, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { TiptapEditor } from "@/components/tiptap-editor";
import { DateTimePicker } from "@/components/date-time-picker";
import { EmailInput } from "@/components/email-input";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const attachmentSchema = z.object({
  name: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "File size must be less than 5MB"),
  type: z
    .enum([...ACCEPTED_FILE_TYPES] as [string, ...string[]])
    .refine((value) => ACCEPTED_FILE_TYPES.includes(value), {
      message: "Invalid file type",
    }),
});

const emailListSchema = z.string().refine(
  (value) => {
    const emails = value.split(",").map((email) => email.trim());
    return emails.every((email) => z.string().email().safeParse(email).success);
  },
  {
    message: "Invalid email address(es)",
  },
);

const formSchema = z.object({
  to: emailListSchema,
  cc: emailListSchema.optional(),
  bcc: emailListSchema.optional(),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  attachments: z.array(attachmentSchema).optional(),
  scheduledAt: z.date().optional(),
});
import { useEffect } from "react";
import { useSession } from "next-auth/react";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export function ComposeEmail() {
  const { data: session, status } = useSession();

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
      cc: undefined,
      bcc: undefined, // Ensure bcc is always a string
      subject: "",
      content: "",
      attachments: [],
    },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("values ", values);

    setIsSubmitting(true);

    const base64Attachments = await Promise.all(
      attachments.map(async (file) => {
        const base64Str = await toBase64(file);
        return {
          name: file.name,
          type: file.type,
          content: base64Str.split(",")[1],
        };
      })
    );

    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: session?.user?.name,
          email: session?.user?.email,
          to: values.to.split(",").map(e => e.trim()),
          cc: values.cc ? values.cc.split(",").map(e => e.trim()) : [],
          bcc: values.bcc ? values.bcc.split(",").map(e => e.trim()) : [],
          subject: values.subject,
          htmlContent: values.content,
          accessToken: session?.accessToken,
          attachments: base64Attachments,
          scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const data = await response.json();
      console.log(data);
      toast({
        title: values.scheduledAt ? "Email scheduled" : "Email sent",
        description: values.scheduledAt
          ? "Your email has been scheduled successfully."
          : "Your email has been sent successfully.",
      });
      form.reset();
      setAttachments([]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: values.scheduledAt
          ? "Failed to schedule the email. Please try again."
          : "Failed to send the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md text-white"
      >
        <div className="flex items-center gap-2 mb-2">
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="sr-only">To</FormLabel>
                <FormControl>
                  <EmailInput placeholder="To" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCc(!showCc)}
            className="text-gray-400 hover:text-white"
          >
            Cc
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowBcc(!showBcc)}
            className="text-gray-400 hover:text-white"
          >
            Bcc
          </Button>
        </div>
        {showCc && (
          <FormField
            control={form.control}
            name="cc"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">CC</FormLabel>
                <FormControl>
                  <EmailInput
                    placeholder="Cc"
                    {...field}
                    value={field.value || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {showBcc && (
          <FormField
            control={form.control}
            name="bcc"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">BCC</FormLabel>
                <FormControl>
                  <EmailInput
                    placeholder="Bcc"
                    {...field}
                    value={field.value || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Subject"
                  {...field}
                  className="border-0 border-b border-gray-600 rounded-none px-0 focus-visible:ring-0 bg-transparent text-white placeholder-gray-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Content</FormLabel>
              <FormControl>
                <TiptapEditor field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => document.getElementById("file-upload")?.click()}
            className="text-gray-400 hover:text-white border-gray-600"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept={ACCEPTED_FILE_TYPES.join(",")}
          />
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DateTimePicker date={field.value} setDate={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {attachments.length > 0 && (
          <ul className="mt-4 space-y-2">
            {attachments.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-600 p-2"
              >
                <span className="text-sm text-gray-300">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </form>
    </Form>
  );
}
