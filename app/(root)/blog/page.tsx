import TaskView from "@/components/web/TaskView";

const BlogPage = () => {
  return (
    <div className="py-6">
      <div className="text-center py-8">
        <h1 className="text-5xl font-bold ">Our Blogs</h1>
        <p className="text-accent-foreground mt-2">
          Check out our latest blogs
        </p>
      </div>
      <TaskView />
    </div>
  );
};

export default BlogPage;
