import type { Metadata } from 'next';
import StocksClient from './StocksClient';

export const metadata: Metadata = {
    title: "Stocks | FINCORE Equity Portfolio",
    description: "Monitor your stock holdings, track performance, and manage equity transactions with real-time insights.",
};

export default function StocksPage() {
    return <StocksClient />;
}
