import { useState } from 'react';
import { ChevronDown, ChevronUp, TypeOutline } from 'lucide-react';

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
            title: '로그인이 안돼요.',
            content:
                "이메일 또는 비밀번호를 다시 한 번 확인해주세요. SNS 계정으로 가입한 경우, 동일한 로그인 방식을 사용해야 합니다.",
        },
        {
            id: 3,
            title: '회원 탈퇴는 어떻게 하나요?',
            content:
                '마이페이지 → ⚙️ -> 회원정보수정 메뉴에서 “회원 탈퇴”를 선택하면 즉시 탈퇴할 수 있습니다.',
        },
        {
            id: 8,
            title: '소셜 로그인은 어떤 계정을 지원하나요?',
            content:
                '현재 카카오 로그인을 지원하고 있으며, 추후 네이버 및 구글 계정 연동도 추가될 예정입니다.',
        },
        {
            id: 9,
            title: '회원정보는 어떻게 수정할 수 있나요?',
            content:
                '마이페이지 → ⚙️ -> 회원정보수정 메뉴에서 닉네임, 프로필 이미지 등 기본 정보를 수정할 수 있습니다.',
        },
    ],

    포인트: [
        {
            id: 4,
            title: '포인트는 어떻게 적립되나요?',
            content:
                '영수증이나 이용내역 사진을 업로드하면 자동 인식 후 포인트가 적립됩니다. 일부 챌린지나 이벤트 참여 시에도 추가 적립이 가능합니다.',
        },
        {
            id: 5,
            title: '포인트 유효기간은 얼마나 되나요?',
            content:
                '적립일로부터 평생 유효합니다. 단, 장기 미이용 시 휴면 정책에 따라 안내 후 소멸될 수 있습니다.',
        },
        {
            id: 6,
            title: '포인트를 어떻게 이용할 수 있나요?',
            content:
                '기프티콘 교환, 캠페인 기부, 1만 포인트 이상일 경우 현금 출금이 가능합니다. 자세한 내용은 포인트 이용 안내를 참고하세요.',
        },
        {
            id: 10,
            title: '포인트가 적립되지 않았어요.',
            content:
                '이미 인증된 영수증이거나 인식이 실패한 경우일 수 있습니다. “1:1 문의하기” 를 통해 사진과 상황을 알려주시면 확인 후 처리해드리겠습니다.',
        },
        {
            id: 11,
            title: '포인트 출금은 어떻게 하나요?',
            content:
                '1만 포인트 이상 보유 시 마이페이지 → 포인트 → “출금 신청” 버튼을 눌러 본인 명의 계좌로 송금받을 수 있습니다.',
        },
        {
            id: 12,
            title: '챌린지 참여 시 포인트가 추가되나요?',
            content:
                '일부 챌린지는 완료 시 추가 포인트가 지급됩니다. 챌린지 상세 페이지에서 포인트 정보를 확인할 수 있습니다.',
        },
    ],

    고객지원: [
        {
            id: 7,
            title: '고객센터 운영시간은?',
            content:
                '평일 오전 9시부터 오후 6시까지 운영됩니다. 주말 및 공휴일은 휴무입니다.',
        },
        {
            id: 13,
            title: '1:1 문의는 어떻게 하나요?',
            content:
                'FAQ 하단의 “1:1 문의하기” 버튼을 클릭하면 문의 페이지로 이동합니다. 접수된 문의는 평균 24시간 이내 답변됩니다.',
        },
        {
            id: 14,
            title: '서비스 오류를 발견했어요.',
            content:
                '발견한 오류나 개선사항은 support@greenmap.com 으로 보내주세요. 빠르게 검토 후 반영하겠습니다.',
        },
        {
            id: 15,
            title: '제휴나 협업 문의는 어디로 하면 되나요?',
            content:
                '환경 기업, 단체와의 제휴를 환영합니다. contact@greenmap.com 으로 메일을 보내주시면 담당자가 확인 후 연락드립니다.',
        },
        {
            id: 16,
            title: '공지사항은 어디서 볼 수 있나요?',
            content:
                '앱 또는 웹 하단의 “공지사항” 메뉴에서 업데이트 및 서비스 변경 내용을 확인하실 수 있습니다.',
        },
    ],
};


// 개별 FAQ 아이템 컴포넌트
function FaqItem({ faq, isOpen, onToggle }) {
    return (
        <div className='border-b border-gray-200'>
           <button
    onClick={onToggle}
    className={`w-full flex items-center justify-between p-5 text-left transition 
        ${isOpen ? 'bg-white-50' : 'hover:bg-white-50'}
        focus:outline-none focus:ring-0 focus-visible:outline-none`}
>
    <span className='font-medium text-gray-800'>{faq.title}</span>
    {isOpen ? (
        <ChevronUp className='text-gray-500 flex-shrink-0' size={20} />
    ) : (
        <ChevronDown className='text-gray-500 flex-shrink-0' size={20} />
    )}
</button>


            {isOpen && (
                <div className='px-5 pt-7 pb-7 text-gray-600 leading-relaxed'>
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
                <div className='flex gap-2 mb-6 bg-white rounded-lg p-2 shadow-sm '>
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

                {/* 하단 고객센터 정보 */}
                <div className='mt-8 text-center text-gray-600'>
                    <p className='mb-2'>찾으시는 답변이 없으신가요?</p>
                    <a
                        href='#'
                        className='text-green-500 font-medium hover:underline'
                    >
                        1:1 문의하기
                    </a>
                </div>
            </div>
        </div>
    );
}
