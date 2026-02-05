import type { Metadata } from 'next';
import IncomeClient from './IncomeClient';

export const metadata: Metadata = {
    title: "Income Hub | FINCORE",
    description: "Track your income sources, salary history, and freelance earnings. Analyze your cash flow and growth over time.",
};

export default function SalaryPage() {
    return <IncomeClient />;
}
