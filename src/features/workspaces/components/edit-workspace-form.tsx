'use client';

import { z } from 'zod';
import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeftIcon, CopyIcon, ImageIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DottedSeparator } from '@/components/dotted-separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Workspace } from '../workspace-types';
import { updateWorkspaceSchema } from '@/features/workspaces/workspaces-schema';
import { useUpdateWorkspace } from '@/features/workspaces/api/use-update-workspace';
import { useConfirm } from '@/hooks/use-confirm';
import { useDeleteWorkspace } from '@/features/workspaces/api/use-delete-workspace';
import { toast } from 'sonner';
import { useResetInviteCode } from '@/features/workspaces/api/use-reset-invite-code';

interface EditWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: Workspace;
}

export const EditWorkspaceForm = ({ onCancel, initialValues }: EditWorkspaceFormProps) => {
  const router = useRouter();

  const { mutate, isPending, isUploading, isUpdating } = useUpdateWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace();
  const { mutate: resetInviteCode, isPending: isResettingInviteCode } = useResetInviteCode();

  const [DeleteDialog, confirmDelete] = useConfirm(
    'Delete Workspace',
    'This action cannot be undone',
    'destructive',
  );
  const [ResetDialog, confirmReset] = useConfirm(
    'Reset Invite Link',
    'This will invalidate current invite link',
    'destructive',
  );


  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      name: initialValues.name,
      image: initialValues.imageUrl ?? '',
    },
  });

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    if (!ok) return;
    resetInviteCode(
      { param: { workspaceId: initialValues.$id } }, {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteWorkspace(
      { param: { workspaceId: initialValues.$id } }, {
        onSuccess: () => {
          window.location.href = '/';
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    console.log('Form values:', values);
    console.log('Form errors:', form.formState.errors);
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : '',
    };
    // Pass form values to the mutation
    mutate({
      form: finalValues,
      param: { workspaceId: initialValues.$id },
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

  const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;
  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(fullInviteLink)
      .then(() => toast.success('Invite link copied to clipboard'));
  };

  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      <ResetDialog />
      <Card className="size-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 p-7">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onCancel || (() => router.push(`/workspaces/${initialValues.$id}`))}
          >
            <ArrowLeftIcon className="mr-2 size-4" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
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
                        Workspace Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter workspace name"
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
                          <p className="text-sm">Workspace Icon</p>
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
                          <FormMessage />
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
                  ) : isUpdating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="size-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Invite Members</h3>
            <p className="text-sm text-muted-foreground">
              Use the invite link to add members to your workspace.
            </p>
            <div className="mt-4">
              <div className="flex items-center gap-x-2">
                <Input disabled value={fullInviteLink} />
                <Button
                  onClick={handleCopyInviteLink}
                  variant="secondary"
                  className="size-12"
                  type="button"
                >
                  <CopyIcon className="size-5" />
                </Button>
              </div>
            </div>
            <DottedSeparator className="py-7" />
            <Button
              className="ml-auto mt-6 w-fit"
              size="sm"
              variant="destructive"
              type="button"
              disabled={isPending || isResettingInviteCode}
              onClick={handleResetInviteCode}
            >
              Reset invite link
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="size-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a workspace is irreversible and will remove all associated data
            </p>
            <Button
              className="ml-auto mt-6 w-fit"
              size="sm"
              variant="destructive"
              type="button"
              disabled={isPending || isDeletingWorkspace}
              onClick={handleDelete}
            >
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

  );
};