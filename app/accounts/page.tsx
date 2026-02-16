import type { Metadata } from 'next';
import AccountsClient from './AccountsClient';

export const metadata: Metadata = {
  title: 'Accounts | FINCORE Personal Vault',
  description:
    'Manage your bank accounts, savings, and other financial entities in one secure place.',
};

export default function AccountsPage() {
  return <AccountsClient />;
}
