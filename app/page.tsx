import { ChatDemo } from "@/components/chat-demo";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-12 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Orcish Chatbot</CardTitle>
          <CardDescription>
            This is a chatbot working on the localhost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatDemo />
        </CardContent>
      </Card>
    </main>
  );
}
