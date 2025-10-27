import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCertification, addPendingCert } from '../../store/slices/certSlice';
import { addPoints } from '../../store/slices/pointSlice';

export default function CertificationScreen() {
    const isOnline = useSelector((s) => s.app.isOnline);
    const dispatch = useDispatch();

    const types = [
        { id: 'r', label: '재활용 센터 방문', points: 30 },
        { id: 'ev', label: '전기차 충전', points: 50 },
        { id: 'z', label: '제로웨이스트 쇼핑', points: 25 },
        { id: 'bike', label: '따릉이 이용', points: 20 },
    ];

    function handleCertification(type) {
        const cert = {
            id: Date.now(),
            type: type.label,
            points: type.points,
            photo: null,
            memo: null,
            date: new Date().toISOString(),
        };

        if (isOnline) {
            dispatch(addCertification(cert));
            dispatch(
                addPoints({
                    points: type.points,
                    type: `${type.label} 인증`,
                    category: '인증',
                })
            );
        } else {
            dispatch(addPendingCert(cert));
            // background sync registration is handled elsewhere
        }
    }

    return (
        <div className='p-4'>
            <h2 className='text-lg font-bold'>인증</h2>
            <div className='grid grid-cols-2 gap-3 mt-3'>
                {types.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleCertification(t)}
                        className='bg-white rounded-2xl p-4 shadow flex flex-col items-start gap-2'
                    >
                        <div className='text-2xl'>
                            {t.id === 'r'
                                ? '♻️'
                                : t.id === 'ev'
                                ? '⚡'
                                : t.id === 'z'
                                ? '🛍️'
                                : '🚴'}
                        </div>
                        <div className='font-medium'>{t.label}</div>
                        <div className='text-xs text-gray-500'>{t.points}P</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
