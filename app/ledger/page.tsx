import type { Metadata } from 'next';
import LedgerClient from './LedgerClient';

export const metadata: Metadata = {
    title: "Ledger | FINCORE Global Activity",
    description: "A comprehensive audit trail of all your financial transactions. Filter, sort, and manage your income and expenses.",
};

export default function LedgerPage() {
    return <LedgerClient />;
}
