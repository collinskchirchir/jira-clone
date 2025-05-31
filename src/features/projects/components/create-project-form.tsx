'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DottedSeparator } from '@/components/dotted-separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { createProjectFormSchema, CreateProjectFormType } from '@/features/projects/project-schema';
import { useCreateProject } from '../api/use-create-project';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

interface CreateProjectFormProps {
  onCancel?: () => void;
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {

  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { mutate, isPending, isUploading, isCreating } = useCreateProject();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateProjectFormType>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: '',
      image: '',
    },
  });

  const onSubmit = (values: CreateProjectFormType) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : '',
      workspaceId,
    };
    // Pass form values to the mutation
    mutate({ form: finalValues }, {
      onSuccess: ({ data }) => {
        form.reset();
        // onCancel?.(); // prevents the redirect

        // TODO: redirect to Project screen
        router.push(`/workspaces/${workspaceId}/projects/${data.$id}`);
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        // 1MB limit
        form.setError('image', { message: 'File size must be less than 1MB' });
        return;
      }
      form.setValue('image', file);
    }
  };

  return (
    <Card className="size-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new project
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter project name"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                        <div className="relative size-[72px] overflow-hidden rounded-md">
                          <Image
                            alt="Logo"
                            fill
                            className="object-cover"
                            src={
                              field.value instanceof File
                                ? URL.createObjectURL(field.value)
                                : field.value
                            }
                          />
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Loader2 className="size-8 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <Avatar className="size-[72px]">
                          <AvatarFallback>
                            <ImageIcon className="size-[36px] text-neutral-400" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <p className="text-sm">Project Icon</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, SVG or JPEG, max 1mb
                        </p>
                        <input
                          className="hidden"
                          type="file"
                          accept=".jpg, .png, .jpeg, .svg"
                          ref={inputRef}
                          onChange={handleImageChange}
                          disabled={isPending}
                        />
                        {field.value ? (
                          <Button
                            type="button"
                            disabled={isPending}
                            variant="destructive"
                            size="xs"
                            className="mt-2 w-fit"
                            onClick={() => {
                              field.onChange(null);
                              if (inputRef.current) {
                                inputRef.current.value = '';
                              }
                            }}
                          >
                            Remove Image
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled={isPending}
                            variant="teritary"
                            size="xs"
                            className="mt-2 w-fit"
                            onClick={() => inputRef.current?.click()}
                          >
                            Upload Image
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && 'invisible')}
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Uploading...
                  </>
                ) : isCreating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};