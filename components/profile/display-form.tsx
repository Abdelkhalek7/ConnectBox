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
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const displayFormSchema = z.object({
  emailDensity: z.enum(["comfortable", "compact"], {
    required_error: "You need to select an email display density.",
  }),
  conversationView: z.boolean().default(true).optional(),
  textDirection: z.enum(["ltr", "rtl"], {
    required_error: "You need to select a text direction.",
  }),
});

type DisplayFormValues = z.infer<typeof displayFormSchema>;

export function DisplayForm() {
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      emailDensity: "comfortable",
      conversationView: true,
      textDirection: "ltr",
    },
  });

  useEffect(() => {
    async function loadDisplay() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          form.reset({
            emailDensity: data.emailDensity || "comfortable",
            conversationView: data.conversationView !== null ? data.conversationView : true,
            textDirection: data.textDirection || "ltr",
          });
        }
      } catch (err) {
        console.error("Failed to load display settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDisplay();
  }, [form]);

  async function onSubmit(data: DisplayFormValues) {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailDensity: data.emailDensity,
          conversationView: data.conversationView,
          textDirection: data.textDirection,
        }),
      });
      if (res.ok) {
        toast({
          title: "Display settings updated",
          description: "Your display preferences have been saved successfully.",
        });
      } else {
        throw new Error("Failed to update display settings");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not save display settings.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading display settings...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="emailDensity"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Email Display Density</FormLabel>
              <FormDescription>
                Choose how compact you want your email list to appear.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                className="grid max-w-md grid-cols-2 gap-8 pt-2"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                    <FormControl>
                      <RadioGroupItem value="comfortable" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-5 w-[80%] rounded-lg bg-[#ecedef]" />
                          <div className="h-4 w-[90%] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Comfortable
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                    <FormControl>
                      <RadioGroupItem value="compact" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-[80%] rounded-lg bg-[#ecedef]" />
                          <div className="h-3 w-[90%] rounded-lg bg-[#ecedef]" />
                          <div className="h-3 w-[95%] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Compact
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="conversationView"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Conversation View</FormLabel>
                <FormDescription>
                  Group emails in the same thread together.
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
        <FormField
          control={form.control}
          name="textDirection"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Text Direction</FormLabel>
              <FormDescription>
                Select your preferred reading text direction.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                className="grid max-w-md grid-cols-2 gap-8 pt-2"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                    <FormControl>
                      <RadioGroupItem value="ltr" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-3 hover:border-accent text-center text-sm font-semibold">
                      Left to Right (LTR)
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                    <FormControl>
                      <RadioGroupItem value="rtl" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-3 hover:border-accent text-center text-sm font-semibold">
                      Right to Left (RTL)
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
        <Button type="submit">Update display settings</Button>
      </form>
    </Form>
  );
}
