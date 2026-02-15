import type { Metadata } from 'next';
import ExpensesClient from './ExpensesClient';

export const metadata: Metadata = {
  title: 'Expenses Hub | FINCORE',
  description:
    'Track and manage your expenses across categories. Monitor spending patterns and control your budget.',
};

export default function ExpensesPage() {
  return <ExpensesClient />;
}
