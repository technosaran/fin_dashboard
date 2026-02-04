import type { Metadata } from 'next';
import FamilyClient from './FamilyClient';

export const metadata: Metadata = {
    title: "Family Hub | FINCORE Shared Wealth",
    description: "Manage transfers and financial support within your family network. Track shared wealth and support history securely.",
};

export default function FamilyPage() {
    return <FamilyClient />;
}
