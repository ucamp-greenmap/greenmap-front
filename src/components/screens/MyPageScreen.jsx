import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/slices/appSlice';


export default function MyPageScreen({ onNavigate }) {
    const dispatch = useDispatch();
    const profile = useSelector((s) => s.user.profile);
    const stats = useSelector((s) => s.user.stats);


    const [showSetting, setShowSetting] = React.useState(true); // 열린상태 고정
   
    const navigate = (tab) => {
        if (typeof onNavigate === 'function') return onNavigate(tab);
        dispatch(setActiveTab(tab));
    };


    const [alarmText, setalarmText] = React.useState('알림설정 ON');
    const alarm = () => {
        setalarmText(prev => (prev === '알림설정 ON' ? '알림설정 OFF' : '알림설정 ON'));
    };


    return (
        <div className='p-4 space-y-4'>
            <button
                className='bg-white rounded-2xl p-3 shadow text-center focus:outline-none'
                aria-label='설정 열기/닫기' onClick={()=> setShowSetting(prev => !prev)}
            >
                <div className='text-xs text-gray-500'>
                    <img src='https://img.icons8.com/?size=1200&id=80555&format=jpg' alt='설정' className='w-7 h-7 mx-auto'></img>
                </div>
            </button>
            <div id='setting' className={showSetting ? '' : 'hidden'}>
                <div>설정</div>
                <div>
                    <button onClick={() => navigate('login')}>회원 계정</button>
                </div>
                <div></div>
                <div>
                    <button onClick={alarm}>{alarmText}</button>
                </div>
            </div>
           
           
            <div className='bg-white rounded-2xl p-4 shadow flex items-center gap-4'>
                <div className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl'>
                    {profile.avatar || '👤'}
                </div>
                <div>
                    <div className='font-bold'>{profile.name}</div>
                    <div className='text-xs text-gray-500'>{profile.email}</div>
                </div>
                <div className='ml-auto text-sm'>{profile.badge}</div>
                <button onClick={() => navigate('badge')}>뱃지 리스트</button>
            </div>


            <div className='grid grid-cols-3 gap-3'>
                <button
                    onClick={() => navigate('points')}
                    className='bg-white rounded-2xl p-3 shadow text-center focus:outline-none hover:bg-gray-50 transition-colors'
                    aria-label='포인트 내역 보기'
                >
                    <div className='text-xs text-gray-500'>포인트</div>
                    <div className='font-bold text-lg'>1,500</div>
                </button>
                <div className='bg-white rounded-2xl p-3 shadow text-center'>
                    <div className='text-xs text-gray-500'>탄소 감축</div>
                    <div className='font-bold text-lg'>
                        {stats.carbonReduction} kg
                    </div>
                </div>
                <button
                    onClick={() => navigate('ranking')}
                    className='bg-white rounded-2xl p-3 shadow text-center focus:outline-none hover:bg-gray-50 transition-colors'
                    aria-label='랭킹 보기'
                >
                    <div className='text-xs text-gray-500'>랭킹</div>
                    <div className='font-bold text-lg'>#{stats.rank}</div>
                </button>
            </div>


            <div className='bg-white rounded-2xl p-3 shadow'>
                <h3 className='font-semibold'>메뉴</h3>
                <ul className='mt-2 space-y-2 text-sm text-gray-700'>
                    <li>
                        <button
                            onClick={() => navigate('point-exchange')}
                            className='hover:text-[#4CAF50] transition-colors focus:outline-none focus:text-[#4CAF50]'
                            aria-label='포인트 교환소 가기'
                        >
                            🎁 포인트 교환소
                        </button>
                    </li>
                    <li>📜 인증 기록 ({stats.totalCerts})</li>
                    <li>🔔 알림 (3)</li>
                    <li className='cursor-pointer'>❓ FAQ & 고객지원</li>
                </ul>
            </div>


            <div className='bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] rounded-2xl p-4 text-white'>
                <h4 className='font-bold'>2024년 10월 요약</h4>
                <div className='text-sm mt-2'>인증 횟수: 24 (지난달 +8)</div>
                <div className='text-sm'>획득 포인트: 850P (지난달 +210)</div>
            </div>


            <div className='text-sm text-gray-500'>그린맵 v1.0.0</div>
        </div>
    );
}



