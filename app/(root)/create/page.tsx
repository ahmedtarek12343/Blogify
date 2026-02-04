"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogSchema } from "@/schemas/blog";
import { Loader2 } from "lucide-react";
import z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import FileUploadComponent from "@/components/comp-544";

const CreatePage = () => {
  const router = useRouter();
  const createPost = useMutation(api.posts.AddPost);
  const generateUploadUrl = useMutation(api.posts.generateImageUploadUrl);

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof blogSchema>) {
    console.log(values);

    try {
      let storageId = undefined;
      if (values.image) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": values.image?.type,
          },
          body: values.image,
        });
        if (!response.ok) {
          throw new ConvexError("Failed to upload image");
        }
        const { storageId: id } = await response.json();
        storageId = id;
      }

      await createPost({
        title: values.title,
        body: values.content,
        image: storageId,
      });
      toast.success("Post created successfully!");
      reset();
      router.push("/blog");
    } catch (error: any) {
      const errorMessage =
        error instanceof ConvexError ? error.data : "Unexpected error occurred";
      toast.error(errorMessage);
    }
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Create a new post
        </h1>
        <p className="text-xl mt-2 text-muted-foreground">
          Share your thoughts with the world
        </p>
      </div>
      <Card className="max-w-2xl w-full mx-auto">
        <CardHeader>
          <CardTitle>Create Blog Article</CardTitle>
          <CardDescription>Create a new blog article</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <FieldGroup className="flex flex-col gap-2">
                <FieldLabel>Title</FieldLabel>
                <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <Input
                        {...field}
                        aria-invalid={!!fieldState.error}
                        placeholder="Title"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>{" "}
              <FieldGroup className="flex flex-col gap-2">
                <FieldLabel>Content</FieldLabel>
                <Controller
                  name="content"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <Textarea
                        {...field}
                        aria-invalid={!!fieldState.error}
                        placeholder="Content"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="flex flex-col gap-2">
                <FieldLabel>Image</FieldLabel>
                <Controller
                  name="image"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FileUploadComponent
                        field={field}
                        aria-invalid={!!fieldState.error}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
            <Button
              className="w-full mt-5"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <p>Creating...</p>
                </>
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePage;
