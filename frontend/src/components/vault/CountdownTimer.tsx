import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

interface CountdownTimerProps {
    lastCheckTime?: string;
    intervalMinutes: number;
    enabled: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ lastCheckTime, intervalMinutes, enabled }) => {
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    console.log('CountdownTimer props:', { lastCheckTime, intervalMinutes, enabled });

    useEffect(() => {
        if (!enabled || !lastCheckTime) {
            console.log('CountdownTimer: not enabled or no lastCheckTime');
            setTimeRemaining('');
            return;
        }

        const updateCountdown = () => {
            const lastCheck = new Date(lastCheckTime);
            const nextCheck = new Date(lastCheck.getTime() + intervalMinutes * 60 * 1000);
            const now = new Date();
            const diff = nextCheck.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('Checking now...');
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            if (minutes > 0) {
                setTimeRemaining(`Next check in: ${minutes}m ${seconds}s`);
            } else {
                setTimeRemaining(`Next check in: ${seconds}s`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [lastCheckTime, intervalMinutes, enabled]);

    if (!enabled) {
        return null;
    }

    // Show a message if no timestamp yet
    if (!lastCheckTime) {
        return (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Waiting for first check...
            </Typography>
        );
    }

    if (!timeRemaining) {
        return null;
    }

    return (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {timeRemaining}
        </Typography>
    );
};

export default CountdownTimer;
