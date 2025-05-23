import Link from 'next/link';
import Image from 'next/image';
import { DottedSeparator } from '@/components/dotted-separator';
import { Navigation } from '@/components/navigation';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';

export const Sidebar = () => {
  return (
    <aside className="size-full bg-neutral-100 p-4">
      <Link href={'/'}>
        <Image src={'/logo.svg'} alt="logo" width={164} height={48} />
      </Link>
      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
    </aside>
  );
};
