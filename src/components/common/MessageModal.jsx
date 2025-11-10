import React from 'react';

function MessageModal({ message, type = 'info', onClose }) {
    const handleClick = () => {
        onClose();
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/40 z-50'>
            <div className='bg-white rounded-2xl shadow-xl w-80 p-6 text-center'>
                <div
                    className={`text-4xl mb-3 ${
                        type === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {type === 'success' ? '🌳' : '🍂'}
                </div>
                <p className='text-gray-800 font-semibold mb-4 mt-4 whitespace-pre-line'>
                    {message}
                </p>
                <button
                    onClick={handleClick}
                    className='w-full py-2 rounded-xl font-bold text-white'
                    style={{
                        background:
                            type === 'success' ? '#96cb6f' : '#e63e3eff',
                    }}
                >
                    확인
                </button>
            </div>
        </div>
    );
}

export default MessageModal;
