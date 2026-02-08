import UserProfile from "@/components/web/UserProfile";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  return <UserProfile id={id} />;
};

export default page;
