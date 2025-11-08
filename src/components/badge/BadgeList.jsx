import React, { useEffect, useState } from 'react';
import { getBadges, selectBadge } from '../../api/badgeApi';

function BadgeListExample() {
    const [badges, setBadges] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        getBadges().then(setBadges).catch(setError);
    }, []);

    const handleSelect = async (name) => {
        try {
            await selectBadge(name);
            setBadges((prev) =>
                prev.map((b) => ({
                    ...b,
                    isSelected: b.name === name,
                }))
            );
        } catch (err) {
            setError(String(err));
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <ul>
            {badges.map((badge) => (
                <li key={badge.name}>
                    <img
                        src={badge.image_url ?? '/default.png'}
                        alt={badge.name}
                    />
                    <span>{badge.name}</span>
                    <button
                        disabled={badge.isSelected}
                        onClick={() => handleSelect(badge.name)}
                    >
                        {badge.isSelected ? '선택됨' : '선택'}
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default BadgeListExample;
