export function parseSender(sender: string): { name: string; email: string } {
  const regex = /"?(.*?)"?\s*<(.+?)>/; // Regular expression to match name and email
  const match = sender.match(regex);

  if (match) {
    return {
      name: match[1].trim(), // The sender's name
      email: match[2].trim(), // The sender's email
    };
  } else {
    return { name: "", email: sender.trim() }; // If no match, treat the whole as email
  }
}
