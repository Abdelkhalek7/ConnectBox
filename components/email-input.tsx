import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface EmailInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder: string;
}

export function EmailInput({ onChange, placeholder }: EmailInputProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      //validate the email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue.trim())) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
        });
        return;
      }
      if (emails.includes(inputValue.trim())) {
        toast({
          title: "Duplicate email",
          description: "Email already added",
        });
        return;
      }
      const newEmails = [...emails, inputValue.trim()];
      setEmails(newEmails);
      onChange(newEmails.join(", "));
      setInputValue("");
    }
  };

  const removeEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
    onChange(newEmails.join(", "));
  };

  return (
    <div className="space-y-2">
      <Input
        type="email"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border-0 border-b border-gray-600 rounded-none px-0 focus-visible:ring-0 bg-transparent text-white placeholder-gray-400"
      />
      <div className="flex flex-wrap gap-2">
        {emails.map((email, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-700 text-white rounded px-2 py-1"
          >
            <span className="text-sm">{email}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-4 w-4 p-0"
              onClick={() => removeEmail(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
