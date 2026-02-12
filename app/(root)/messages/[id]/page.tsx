import ChatList from "@/components/web/ChatList";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  return (
    <>
      <ChatList id={id} />
    </>
  );
};

export default page;
