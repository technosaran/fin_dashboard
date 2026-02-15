import type { Metadata } from 'next';
import MutualFundsClient from './MutualFundsClient';

export const metadata: Metadata = {
  title: 'Mutual Funds | FINCORE Systematic Wealth',
  description:
    'Track your SIPs and mutual fund investments. Analyze portfolio growth and manage holdings across categories.',
};

export default function MutualFundsPage() {
  return <MutualFundsClient />;
}
