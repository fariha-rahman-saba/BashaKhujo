import ChatRoom from "./ChatRoom";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatRoom id={id} />;
}
