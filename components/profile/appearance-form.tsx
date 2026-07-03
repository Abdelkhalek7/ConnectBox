"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

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
import { toast } from "@/hooks/use-toast";

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export function AppearanceForm() {
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
    },
  });

  useEffect(() => {
    async function loadAppearance() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          form.reset({
            theme: data.theme || "system",
          });
        }
      } catch (err) {
        console.error("Failed to load appearance settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAppearance();
  }, [form]);

  async function onSubmit(data: AppearanceFormValues) {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: data.theme,
        }),
      });
      if (res.ok) {
        setTheme(data.theme);
        toast({
          title: "Appearance settings updated",
          description: "Your appearance theme has been saved successfully.",
        });
      } else {
        throw new Error("Failed to update appearance");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not save appearance settings.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading appearance...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for your mail application.
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                className="grid max-w-md grid-cols-3 gap-8 pt-2"
              >
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                    <FormControl>
                      <RadioGroupItem value="light" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Light
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="[&:has([data-state=checked])>div]:border-primary cursor-pointer">
                    <FormControl>
                      <RadioGroupItem value="dark" className="sr-only" />
                    </FormControl>
                    <div className="items-center rounded-md border-2 border-primary p-1-unused">
                      <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                        <div className="space-y-2 rounded-sm bg-zinc-950 p-2">
                          <div className="space-y-2 rounded-md bg-zinc-900 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-zinc-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-zinc-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-zinc-900 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-zinc-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-zinc-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-md bg-zinc-900 p-2 shadow-sm">
                            <div className="h-4 w-4 rounded-full bg-zinc-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-zinc-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                      Dark
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
        <Button type="submit">Update appearance</Button>
      </form>
    </Form>
  );
}
