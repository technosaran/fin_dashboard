import type { Metadata } from 'next';
import ForexClient from './ForexClient';

export const metadata: Metadata = {
  title: 'Forex | FINCORE Currency Portfolio',
  description:
    'Monitor your forex trades, track currency performance, and manage currency investments with real-time insights.',
};

export default function ForexPage() {
  return <ForexClient />;
}
