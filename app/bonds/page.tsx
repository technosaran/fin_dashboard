import type { Metadata } from 'next';
import BondsClient from './BondsClient';

export const metadata: Metadata = {
    title: "Bonds Portfolio | FINCORE",
    description: "Track your Indian corporate bonds and fixed-income assets with live yield analysis.",
};

export default function BondsPage() {
    return <BondsClient />;
}
