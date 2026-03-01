import type { Metadata } from 'next';
import BondsClient from './BondsClient';

export const metadata: Metadata = {
  title: 'Bonds | FINCORE Income Portfolio',
  description:
    'Monitor your bond holdings, track yields, and manage fixed income transactions with real-time insights.',
};

export default function BondsPage() {
  return <BondsClient />;
}
