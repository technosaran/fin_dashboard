import FnOClient from './FnOClient';

export const metadata = {
    title: 'FnO Portfolio | FINCORE',
    description: 'Track your Futures and Options trades with Zerodha-style insights',
};

export default function FnOPage() {
    return <FnOClient />;
}
