import React, { useState } from 'react';

const BadgeForm = () => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [icon, setIcon] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: API 연동
        alert(`뱃지 추가: ${name}, 설명: ${desc}, 아이콘: ${icon}`);
        setName('');
        setDesc('');
        setIcon('');
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
                <label className='block mb-1 font-medium'>뱃지 이름</label>
                <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full border rounded px-3 py-2'
                    required
                />
            </div>
            <div>
                <label className='block mb-1 font-medium'>설명</label>
                <input
                    type='text'
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className='w-full border rounded px-3 py-2'
                />
            </div>
            <div>
                <label className='block mb-1 font-medium'>아이콘 URL</label>
                <input
                    type='text'
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className='w-full border rounded px-3 py-2'
                />
            </div>
            <button
                type='submit'
                className='bg-primary text-white px-4 py-2 rounded'
            >
                뱃지 추가
            </button>
        </form>
    );
};

export default BadgeForm;
