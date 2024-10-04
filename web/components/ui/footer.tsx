import Link from 'next/link';
import { Mail, X } from 'lucide-react';
import { ClusterUiSelect } from '../cluster/cluster-ui';

export function Footer() {
  return (
    <footer className="flex items-center justify-between p-4 border-t">
      <div className="flex space-x-4">
        <Link href="https://x.com/GigenticAI" className="">
          <X className="w-6 h-6" />
          <span className="sr-only">Twitter</span>
        </Link>
        <Link href="mailto:info@gigentic.com" className="">
          <Mail className="w-6 h-6" />
          <span className="sr-only">Email</span>
        </Link>
      </div>
      <p className="text-sm ">© 2024 Gigentic</p>
      <ClusterUiSelect />
    </footer>
  );
}
