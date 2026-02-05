"use client";

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
    const router = useRouter();

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts when user is typing in an input
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        // Command/Ctrl + K for quick navigation (can be expanded)
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            // Can add a command palette here later
            return;
        }

        // Single key shortcuts
        switch (event.key) {
            case 'd':
                router.push('/');
                break;
            case 'a':
                router.push('/accounts');
                break;
            case 's':
                router.push('/stocks');
                break;
            case 'm':
                router.push('/mutual-funds');
                break;
            case 'g':
                router.push('/goals');
                break;
            case 'l':
                router.push('/ledger');
                break;
            case 'e':
                router.push('/expenses');
                break;
            case '?':
                // Show keyboard shortcuts help
                event.preventDefault();
                break;
        }
    }, [router]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);
}
