import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// FAQ 데이터
const faqData = {
    인증: [
        {
            id: 1,
            title: '회원가입은 어떻게 하나요?',
            content:
                "상단의 '회원가입' 버튼을 클릭하여 이메일과 비밀번호를 입력하시면 간편하게 가입하실 수 있습니다.",
        },
        {
            id: 2,
            title: '비밀번호를 잊어버렸어요',
            content:
                "로그인 페이지에서 '비밀번호 찾기'를 클릭하시면 가입하신 이메일로 재설정 링크를 보내드립니다.",
        },
        {
            id: 3,
            title: '로그인이 안돼요',
            content:
                '이메일과 비밀번호를 정확히 입력했는지 확인해주세요. 대소문자를 구분합니다.',
        },
    ],
    포인트: [
        {
            id: 4,
            title: '포인트는 어떻게 적립되나요?',
            content:
                '영수증이나 이용내역 사진을 찍어서 올리면 자동 인식 후 포인트가 적립됩니다',
        },
        {
            id: 5,
            title: '포인트 유효기간은 얼마나 되나요?',
            content:
                '적립일로부터 3년간 유효합니다. 유효기간이 지나면 자동으로 소멸됩니다.',
        },
        {
            id: 6,
            title: '포인트를 어떻게 이용할 수 있나요? ',
            content:
                '기프티콘으로 교환하거나, 1만 포인트 이상이면 본인 계좌로 현금 출금이 가능합니다.',
        },
    ],
    고객지원: [
        {
            id: 7,
            title: '고객센터 운영시간은?',
            content:
                '평일 오전 9시부터 오후 6시까지 운영됩니다. 주말 및 공휴일은 휴무입니다.',
        },
    ],
};

// 개별 FAQ 아이템 컴포넌트
function FaqItem({ faq, isOpen, onToggle }) {
    return (
        <div className='border-b border-gray-200'>
            <button
                onClick={onToggle}
                className='w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition'
            >
                <span className='font-medium text-gray-800'>{faq.title}</span>
                {isOpen ? (
                    <ChevronUp
                        className='text-gray-500 flex-shrink-0'
                        size={20}
                    />
                ) : (
                    <ChevronDown
                        className='text-gray-500 flex-shrink-0'
                        size={20}
                    />
                )}
            </button>
            {isOpen && (
                <div className='px-5 pb-5 text-gray-600 leading-relaxed'>
                    {faq.content}
                </div>
            )}
        </div>
    );
}

// 메인 FAQ 페이지
export default function FaqScreen() {
    const [selectedTab, setSelectedTab] = useState('인증');
    const [openItemId, setOpenItemId] = useState(null);

    const tabs = ['인증', '포인트', '고객지원'];

    const handleToggle = (id) => {
        setOpenItemId(openItemId === id ? null : id);
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-4xl mx-auto px-4'>
                {/* 헤더 */}
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                        FAQ & 고객지원
                    </h1>
                    <p className='text-gray-600'>
                        궁금하신 내용을 빠르게 찾아보세요
                    </p>
                </div>

                {/* 탭 메뉴 */}
                <div className='flex gap-2 mb-6 bg-white rounded-lg p-2 shadow-sm'>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setSelectedTab(tab);
                                setOpenItemId(null); // 탭 변경시 열린 항목 초기화
                            }}
                            className={`flex-1 py-3 px-4 rounded-md font-medium transition ${
                                selectedTab === tab
                                    ? 'bg-lime-500  text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* FAQ 리스트 */}
                <div className='bg-white rounded-lg shadow-sm'>
                    {faqData[selectedTab].map((faq) => (
                        <FaqItem
                            key={faq.id}
                            faq={faq}
                            isOpen={openItemId === faq.id}
                            onToggle={() => handleToggle(faq.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
