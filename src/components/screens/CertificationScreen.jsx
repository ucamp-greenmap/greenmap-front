import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CertTypeCard from '../cert/CertTypeCard';
import CertModal from '../cert/CertModal';
import { certTypes } from '../../util/certConfig';

export default function CertificationScreen() {
    const isOnline = useSelector((s) => s.app.isOnline);
    const [selectedType, setSelectedType] = useState(null);
    const [showModal, setShowModal] = useState(false);

    function openCertModal(type) {
        setSelectedType(type);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setSelectedType(null);
    }

    // 최근 인증 내역 (임시 데이터)
    const recentCertifications = [
        {
            id: 1,
            type: '전기차 충전',
            date: '2024-10-23',
            points: 50,
            status: 'approved',
        },
        {
            id: 2,
            type: '재활용',
            date: '2024-10-22',
            points: 30,
            status: 'approved',
        },
        {
            id: 3,
            type: '제로웨이스트',
            date: '2024-10-21',
            points: 25,
            status: 'pending',
        },
    ];

    return (
        <>
            <div
                className='min-h-screen bg-gray-50'
                style={{ paddingBottom: 'var(--bottom-nav-inset)' }}
            >
                {/* Header */}
                <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] px-6 py-8'>
                    <h1 className='text-3xl font-bold text-white mb-2'>
                        인증하기
                    </h1>
                    <p className='text-white text-opacity-90 text-sm'>
                        친환경 활동을 인증하고 포인트를 받으세요
                    </p>
                </div>

                <div className='px-6 py-6 space-y-6'>
                    {/* 인증 타입 선택 */}
                    <div>
                        <h2 className='text-lg font-bold text-gray-900 mb-4'>
                            인증할 활동 선택
                        </h2>
                        <div className='space-y-3'>
                            {certTypes.map((type) => (
                                <CertTypeCard
                                    key={type.id}
                                    type={type}
                                    onClick={openCertModal}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 인증 팁 */}
                    <div className='bg-[#8BC34A] bg-opacity-10 rounded-2xl p-5 border border-[#8BC34A] border-opacity-30'>
                        <h3 className='font-bold text-gray-900 mb-3'>
                            📌 인증 팁
                        </h3>
                        <ul className='space-y-2 text-gray-600 text-sm'>
                            <li className='flex items-start gap-2'>
                                <span className='text-[#4CAF50] mt-0.5'>✓</span>
                                <span>
                                    영수증이 선명하게 보이도록 촬영해주세요
                                </span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-[#4CAF50] mt-0.5'>✓</span>
                                <span>
                                    전자 영수증 글씨가 잘 보이도록 영수증을
                                    첨부해주세요
                                </span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-[#4CAF50] mt-0.5'>✓</span>
                                <span>인증은 바로 승인됩니다</span>
                            </li>
                        </ul>
                    </div>

                    {/* 최근 인증 내역 */}
                    <div>
                        <h2 className='text-lg font-bold text-gray-900 mb-4'>
                            최근 인증 내역
                        </h2>
                        <div className='bg-white rounded-2xl overflow-hidden border border-gray-100'>
                            {recentCertifications.map((cert, index) => (
                                <div
                                    key={cert.id}
                                    className={`p-5 flex items-center justify-between ${
                                        index !==
                                        recentCertifications.length - 1
                                            ? 'border-b border-gray-100'
                                            : ''
                                    }`}
                                >
                                    <div>
                                        <p className='font-medium text-gray-900'>
                                            {cert.type}
                                        </p>
                                        <p className='text-gray-500 text-sm mt-1'>
                                            {cert.date}
                                        </p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-[#4CAF50] font-semibold'>
                                            +{cert.points}P
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 이번 달 진행상황 */}
                    <div className='bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-2xl p-6 text-white shadow-lg'>
                        <h3 className='text-white text-opacity-90 mb-4 font-semibold'>
                            이번 달 진행상황
                        </h3>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <p className='text-white text-opacity-80 text-sm mb-1'>
                                    인증 횟수
                                </p>
                                <p className='text-3xl font-bold'>12</p>
                            </div>
                            <div>
                                <p className='text-white text-opacity-80 text-sm mb-1'>
                                    획득 포인트
                                </p>
                                <p className='text-3xl font-bold'>520P</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 */}
            {showModal && selectedType && (
                <CertModal type={selectedType} onClose={closeModal} />
            )}
        </>
    );
}
