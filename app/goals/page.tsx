import type { Metadata } from 'next';
import GoalsClient from './GoalsClient';

export const metadata: Metadata = {
    title: "Goals | FINCORE Milestone Tracker",
    description: "Set and achieve your financial milestones. Track progress on career, health, and lifestyle objectives with detailed analytics.",
};

export default function GoalsPage() {
    return <GoalsClient />;
}
