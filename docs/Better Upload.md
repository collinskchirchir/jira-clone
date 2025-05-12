---
created: "{{date}} {{time}}"
tags:
---
# [Better Upload Introduction](https://better-upload.js.org/)

Better Upload is a file upload library for React that makes it very simple and easy to upload files directly to any S3-compatible service. It handles both the client and your server.

While Better Upload is designed to work with Next.js, it can also work with any framework / backend server that uses standard Request and Response objects. Like [Remix](https://remix.run/) and [Hono](https://hono.dev/)!

## [Why Better Upload?](https://better-upload.js.org/#why-better-upload)

- **Simple**: It's very simple to use, just a few lines of code and you're ready to go.
- **Fast to setup**: It takes a few to minutes to setup and start uploading files directly to your S3 bucket.
- **Beautiful**: Better Upload has copy-and-paste [shadcn/ui](https://ui.shadcn.com/) components that you can use to rapidly build UI.

## [Features](https://better-upload.js.org/#features)

- **Upload to S3**: Upload files directly to your S3 bucket, without additional fees.
- **Customizable Server**: Run code on your server on upload events. Adding auth and rate-limiting is easy.
- **React Hooks**: Use React hooks to easily upload files.
- **Helpers**: Helpers to make working with S3 easier.

# Quickstart

You can setup file upload in your Next.js app in a few minutes with Better Upload. If you are using another framework or a backend server, check out [Other Frameworks](https://better-upload.js.org/other-frameworks).

This guide will walk you through the steps to set it up with Next.js, but the steps are similar for other frameworks.

## [Prerequisites](https://better-upload.js.org/quickstart#prerequisites)

Before you start, make sure you have the following:

- A Next.js project.
- An S3-compatible bucket. You can use AWS S3, Cloudflare R2, or any other.

## [Uploading your first image](https://better-upload.js.org/quickstart#uploading-your-first-image)

### [Install](https://better-upload.js.org/quickstart#install)

Install the `better-upload` package, as well as the AWS S3 Client.

```
npm install better-upload @aws-sdk/client-s3
```

### [Set up the Route Handler](https://better-upload.js.org/quickstart#set-up-the-route-handler)

The Route Handler will create pre-signed URLs, which the client uses to upload files directly to the S3 bucket. The recommended location for Next.js is `app/api/upload/route.ts`.

Change `your-bucket-name` to your S3 bucket name, and configure the S3 client as needed.

app/api/upload/route.ts

```
import { S3Client } from '@aws-sdk/client-s3';import { createUploadRouteHandler, route } from 'better-upload/server'; const s3 = new S3Client();  export const { POST } = createUploadRouteHandler({  client: s3,  bucketName: 'your-bucket-name',   routes: {    demo: route({      fileTypes: ['image/*'],    }),  },});
```

In the example above, we create the upload route `demo` for single images. You can create multiple routes for different purposes, like uploading more than one file. Learn more about routes [here](https://better-upload.js.org/routes).

### [Place the Upload Button](https://better-upload.js.org/quickstart#place-the-upload-button)

The upload button component is used to upload single files. Put it in a component/page.

You can install it via the [shadcn](https://ui.shadcn.com/) CLI:

```
npx shadcn@latest add "https://better-upload.js.org/r/upload-button.json"
```

app/page.tsx

```
'use client'; import { UploadButton } from '@/components/ui/upload-button'; export default function Page() {  return (    <main className="flex min-h-screen flex-col items-center justify-center">      <UploadButton        route="demo"        accept="image/*"        onUploadComplete={({ file }) => {          alert(`Uploaded ${file.name}`);        }}      />    </main>  );}
```

Whether you put it in a component or a page, mark it with `'use client';`, as the pre-built components need to be used in client components.

### [You're done! 🎉](https://better-upload.js.org/quickstart#youre-done-)

You can now run your app and upload an image directly to any S3-compatible service!

If you plan on uploading files larger than 5GB, take a look at [multipart uploads](https://better-upload.js.org/routes#multipart-uploads).

### CORS Configuration
Make sure to also correctly configure CORS on your bucket. Here is an example:

```
[  {    "AllowedOrigins": [      "http://localhost:3000",      "https://example.com" // Add your domain here    ],    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],    "AllowedHeaders": ["*"],    "ExposeHeaders": ["ETag"]  }]
```

Learn more about CORS [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html).

# Upload Routes

Upload routes are where you define how the files are uploaded. To create a route, use the `route` function. You can create multiple routes for different purposes (e.g. images, videos). A basic example is below.

```
import { route } from 'better-upload/server'; route({  fileTypes: ['image/*'], // Accepts all image types  maxFileSize: 1024 * 1024 * 4, // 4MB});
```

All routes have the following options:

- `fileTypes`: An array of file types to accept. Use any valid MIME type. Like `application/pdf` to accept PDF files. You can also use wildcards like `image/*` to accept all image types. By default, all file types are accepted.
- `maxFileSize`: The maximum file size in bytes. Default is 5MB.
- `signedUrlExpiresIn`: The time in seconds the upload signed URL is valid. Default is 120 seconds (2 minutes).

## [Callbacks](https://better-upload.js.org/routes#callbacks)

When defining a route, you may want to run code before or after the upload. You can do this by using the callbacks.

### [Before upload](https://better-upload.js.org/routes#before-upload)

The `onBeforeUpload` callback is called before the pre-signed URL is generated. Use this to run custom logic before uploading a file, such as auth and rate-limiting. You can also customize the S3 object key here.

Throw an `UploadFileError` to reject the file upload. This will also send the error message to the client.

```
import { route, UploadFileError } from 'better-upload/server'; route({  onBeforeUpload: async ({ req, file, clientMetadata }) => {    const user = await auth();     if (!user) {      throw new UploadFileError('Not logged in!');    }     return {      objectKey: user.id,      bucketName: 'another-bucket',    };  },});
```

You can return an object with the following properties:

- `objectKey`: The S3 object key. If not provided, a random key will be generated. For multiple files, return `generateObjectKey` instead.
- `objectMetadata`: Metadata to be added to the S3 object, should be string key-value pairs. For multiple files, return `generateObjectMetadata` instead.
- `metadata`: Metadata to be passed to the `onAfterSignedUrl` callback.
- `bucketName`: If you wish to upload to a bucket different from the one defined in the router, you can specify its name here.

The request and metadata sent from the client are also available.

### [After generating signed URL](https://better-upload.js.org/routes#after-generating-signed-url)

The `onAfterSignedUrl` callback is called after the pre-signed URL is generated. Use this to run custom logic after the URL is generated, such as logging and saving data.

Metadata from the `onBeforeUpload` callback is available, as well as metadata sent from the client.

```
import { route } from 'better-upload/server'; route({  onAfterSignedUrl: async ({ req, file, metadata, clientMetadata }) => {    console.log('After signed URL:', file.objectKey);     return {      metadata: {        example: '123',      },    };  },});
```

You can return an object with the following properties:

- `metadata`: Metadata to be sent back to the client. Needs to be JSON serializable.

## [Multiple files](https://better-upload.js.org/routes#multiple-files)

By default, an upload route only accepts a single file. If you want to upload multiple files, set `multipleFiles` to `true`.

```
import { route } from 'better-upload/server'; route({  maxFileSize: 1024 * 1024 * 4, // For each file  multipleFiles: true,   maxFiles: 4, });
```

The callbacks are also a bit different when uploading multiple files. See the example below.

```
import { route } from 'better-upload/server'; route({  multipleFiles: true,  maxFiles: 4,  onBeforeUpload: async ({ req, files, clientMetadata }) => {    // files is an array     return {      generateObjectKey: ({ file }) => `files/${file.name}`,    };  },  onAfterSignedUrl: async ({ req, files, metadata, clientMetadata }) => {    // files is an array  },});
```

Both now get an array of files (`files`), instead of a single file (`file`).

`onBeforeUpload` now needs to return `generateObjectKey`, instead of just returning a string in `objectKey`.

## [Multipart uploads](https://better-upload.js.org/routes#multipart-uploads)

If you want to upload files larger than 5GB, you need to use multipart uploads. To enable it, set `multipart` to `true`. It works both for single and multiple files. No change is needed in the client.

```
import { route } from 'better-upload/server'; route({  multipart: true,   partSize: 1024 * 1024 * 20, // 20MB, default is 50MB});
```

You can also modify the following options:

- `partSize`: The size of each part in bytes. Default is 50MB.
- `partSignedUrlExpiresIn`: The time in seconds the part signed URL is valid. Default is 1500 seconds (25 minutes).
- `completeSignedUrlExpiresIn`: The time in seconds the complete signed URL is valid. Default is 1800 seconds (30 minutes).

## [Router](https://better-upload.js.org/routes#router)

The router is where you define all of your upload routes. To define a router you can use the `Router` type, then just create an object.

```
import { route, type Router } from 'better-upload/server'; export const router: Router = {  client: s3,  bucketName: 'your-bucket-name',  routes: {    demo: route({      fileTypes: ['image/*'],    }),  },};
```

You can also just define it in the upload route handler, which is simpler.

# Client Hooks

Better Upload provides React hooks that allow you to easily upload files using pre-signed URLs. Multipart uploads are managed automatically, in case you enable them in the server.

## [Usage](https://better-upload.js.org/hooks#usage)

### [Single file](https://better-upload.js.org/hooks#single-file)

To upload single files, use the `useUploadFile` hook.

```
import { useUploadFile } from 'better-upload/client'; export function MyComponent() {  const {    upload,    uploadedFile,    progress,    isPending,    isSuccess,    isError,    error,    reset,  } = useUploadFile({    route: 'demo',  });   return (    <input      type="file"      onChange={(e) => {        if (e.target.files?.[0]) {          upload(e.target.files[0]);        }      }}    />  );}
```

API Endpoint

If your upload route handler is not located at `/api/upload`, you need to specify the correct path in the `api` option.

### [Multiple files](https://better-upload.js.org/hooks#multiple-files)

To upload multiple files at once, use the `useUploadFiles` hook.

```
import { useUploadFiles } from 'better-upload/client'; export function MyComponent() {  const {    upload,    uploadedFiles,    failedFiles,    progresses,    isPending,    isSuccess,    isError,    error,    reset,  } = useUploadFiles({    route: 'demo',  });   return (    <input      type="file"      multiple      onChange={(e) => {        if (e.target.files) {          upload(e.target.files);        }      }}    />  );}
```

#### [Sequential upload](https://better-upload.js.org/hooks#sequential-upload)

With multiple files, you can also upload sequentially, rather than in parallel. This can be useful to reduce the load on the client and S3 server, however, it will take longer to upload all files.

```
useUploadFiles({  route: 'demo',  sequential: true,});
```

## [Options](https://better-upload.js.org/hooks#options)

Both hooks have the following options:

- `api`: The API endpoint to use for uploading files. Default is `/api/upload`.
- `route`: The route to use for uploading files. Needs to match the upload route in the server.
- `multipartBatchSize`: The number of parts to upload at the same time when uploading a multipart file. By default, all parts are uploaded in parallel.

## [Events](https://better-upload.js.org/hooks#events)

### [On before upload](https://better-upload.js.org/hooks#on-before-upload)

Callback that is called before requesting the pre-signed URLs. Use this to modify the files before uploading them, like resizing or compressing. You can also throw an error to reject the file upload.

Single fileMultiple files

```
useUploadFile({  route: 'demo',  onBeforeUpload: ({ file }) => {    // rename the file    return new File([file], 'renamed-' + file.name, { type: file.type })  },});
```

### [On upload begin](https://better-upload.js.org/hooks#on-upload-begin)

Event that is called when the file starts being uploaded to the S3 bucket. Happens after your server responds with a pre-signed URL.

Single fileMultiple files

```
useUploadFile({  route: 'demo',  onUploadBegin: ({ file, metadata }) => {    console.log('Upload begin');  },});
```

### [On upload progress](https://better-upload.js.org/hooks#on-upload-progress)

Event that is called when the file upload progress changes.

Single fileMultiple files

```
useUploadFile({  route: 'demo',  onUploadProgress: ({ file, progress }) => {    console.log(`Upload progress: ${progress * 100}%`);  },});
```

### [On upload complete](https://better-upload.js.org/hooks#on-upload-complete)

Event that is called after the file has been successfully uploaded. If some files failed to upload, they will be in the `failedFiles` array.

Single fileMultiple files

```
useUploadFile({  route: 'demo',  onUploadComplete: ({ file, metadata }) => {    console.log('File uploaded');  },});
```

### [On upload error](https://better-upload.js.org/hooks#on-upload-error)

Event that is called if the upload fails. This can be called more than once for multiple files.

Single fileMultiple files

```
useUploadFile({  route: 'demo',  onUploadError: (error) => {    console.log(error.message);  },});
```

### [On upload settled](https://better-upload.js.org/hooks#on-upload-settled)

Event that is called when the file upload has settled, regardless of success or failure.

Single fileMultiple files

```
useUploadFile({  route: 'demo',  onUploadSettled: () => {    console.log('Upload settled');  },});
```

## [Error handling](https://better-upload.js.org/hooks#error-handling)

### [Failed multiple files](https://better-upload.js.org/hooks#failed-multiple-files)

When uploading multiple files, although rare, some files may fail to upload. In this case, the `failedFiles` array will contain the files that failed to upload.

If this happens, `isSuccess` and `isError` will be `true`, and the upload complete event will be called.

# Other Frameworks

Better Upload can work in any framework with API routes that use standard Request and Response objects. You can even use it in a separate backend server, like [Hono](https://hono.dev/).

Here are some examples of how to use Better Upload in other frameworks:

## [Full Stack](https://better-upload.js.org/other-frameworks#full-stack)

### [Remix](https://better-upload.js.org/other-frameworks#remix)

The only difference when using Better Upload with Remix is how you define your handler. You can use `handleRequest` to handle a generic request.

app/routes/api.upload.ts

```
import { ActionFunctionArgs } from '@remix-run/node';import { handleRequest } from 'better-upload/server'; export async function action({ request }: ActionFunctionArgs) {  return handleRequest(request, {    // your router config...  });}
```

### [TanStack Start](https://better-upload.js.org/other-frameworks#tanstack-start)

Similarly to Remix, you can use `handleRequest` to handle a generic request in TanStack Start.

routes/api/upload.ts

```
import { createAPIFileRoute } from '@tanstack/start/api';import { handleRequest, type Router } from 'better-upload/server'; const router: Router = {  // your router config...}; export const APIRoute = createAPIFileRoute('/api/upload')({  POST: async ({ request }) => {    return handleRequest(request, router);  },});
```

## [Backend](https://better-upload.js.org/other-frameworks#backend)

When using a different backend server, make sure to update the `api` option on the client hooks and components.

### [Hono](https://better-upload.js.org/other-frameworks#hono)

```
import { Hono } from 'hono';import { handleRequest } from 'better-upload/server'; const app = new Hono(); app.post('/api/upload', (c) => {  return handleRequest(c.req.raw, {    // your router config...  });});
```

# COMPONENTS
## Upload Button

A button that uploads a single file.

## [Demo](https://better-upload.js.org/components/upload-button#demo)

Upload file

## [Installation](https://better-upload.js.org/components/upload-button#installation)

CLIManual

```
npx shadcn@latest add "https://better-upload.js.org/r/upload-button.json"
```

## [Usage](https://better-upload.js.org/components/upload-button#usage)

The `<UploadButton />` should be used inside a client component.

```
'use client'; import { UploadButton } from '@/components/ui/upload-button';
```

```
<UploadButton  route="demo"  accept="image/*"  onBeforeUpload={({ file }) => {    // rename the file    return new File([file], 'renamed-' + file.name, { type: file.type });  }}  onUploadBegin={({ file, metadata }) => {    console.log('Upload begin');  }}  onUploadProgress={({ file, progress }) => {    console.log(`Upload progress: ${progress * 100}%`);  }}  onUploadComplete={({ file, metadata }) => {    console.log('Upload complete');  }}  onUploadError={(error) => {    console.log(error.message);  }}  onUploadSettled={() => {    console.log('Upload settled');  }}/>
```

If your upload route handler is not located at `/api/upload`, modify the `api` prop to match your path.

The button will open a file picker dialog when clicked, and upload the selected file to the desired route.

## [Props](https://better-upload.js.org/components/upload-button#props)

| Prop                | Type                                   | Default       |
| ------------------- | -------------------------------------- | ------------- |
| `onUploadSettled?`  | `function \| undefined`                | -             |
| `onUploadError?`    | `function \| undefined`                | -             |
| `onUploadComplete?` | `function \| undefined`                | -             |
| `onUploadProgress?` | `function \| undefined`                | -             |
| `onUploadBegin?`    | `function \| undefined`                | -             |
| `onBeforeUpload?`   | `function \| undefined`                | -             |
| `metadata?`         | `Record<string, unknown> \| undefined` | -             |
| `accept?`           | `string \| undefined`                  | -             |
| `route?`            | `string`                               | -             |
| `api?`              | `string`                               | `/api/upload` |


___
# References