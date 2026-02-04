import ExpensesClient from './ExpensesClient';

export const metadata = {
    title: 'Expenses | FINCORE',
    description: 'Track and manage your daily expenses',
};

export default function ExpensesPage() {
    return <ExpensesClient />;
}
