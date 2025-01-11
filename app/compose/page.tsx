import { Metadata } from "next";
import { ComposeEmail } from "@/components/compose-email";

export const metadata: Metadata = {
  title: "Compose Email",
  description: "Compose and send a new email",
};

export default function ComposePage() {
  return (
    <div className="container mx-auto py-10">
      <ComposeEmail />
    </div>
  );
}
