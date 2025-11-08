import React, { useState } from 'react';

const ChallengeForm = () => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [point, setPoint] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: API 연동
        alert(`챌린지 추가: ${title}, 설명: ${desc}, 포인트: ${point}`);
        setTitle('');
        setDesc('');
        setPoint('');
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
                <label className='block mb-1 font-medium'>챌린지 제목</label>
                <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                <label className='block mb-1 font-medium'>포인트</label>
                <input
                    type='number'
                    value={point}
                    onChange={(e) => setPoint(e.target.value)}
                    className='w-full border rounded px-3 py-2'
                />
            </div>
            <button
                type='submit'
                className='bg-primary text-white px-4 py-2 rounded'
            >
                챌린지 추가
            </button>
        </form>
    );
};

export default ChallengeForm;
