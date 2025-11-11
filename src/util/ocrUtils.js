// =================================================================
// ⚙️ 1. 거리 추출 함수 (따릉이용)
// =================================================================
export function extractDistance(text) {
    const normalizedText = text.replace(/\s{2,}/g, ' ');

    const patterns = [
        // 기본 패턴들
        /거\s*리\s*[:/\s]*([0-9]+\.[0-9]{1,4})\s*km/i,
        /이\s*동\s*거\s*리\s*[:/\s]*([0-9]+\.[0-9]{1,4})/i,
        /([0-9]+\.[0-9]{1,4})\s*km/i,
        // km이 깨진 경우 (ㅁ, ㅠ, m, 미터 등)
        /거\s*리\s*[:/\s]*([0-9]+\.[0-9]{1,4})\s*[ㅁㅠkm미터]/i,
        /이\s*동\s*거\s*리\s*[:/\s]*([0-9]+\.[0-9]{1,4})\s*[ㅁㅠkm미터]/i,
        /([0-9]+\.[0-9]{1,4})\s*[ㅁㅠ]/i,
    ];

    let maxDistance = 0;

    for (const pattern of patterns) {
        const match = normalizedText.match(pattern);

        if (match) {
            const numStr = match[1];
            const num = parseFloat(numStr);

            if (!isNaN(num) && num > 0) {
                if (num > maxDistance) {
                    maxDistance = num;
                }
            }
        }
    }

    return maxDistance;
}

// =================================================================
// ⚙️ 2. 충전량 및 금액을 동시에 추출하여 객체로 반환하는 함수
// =================================================================
export function extractAmounts(text) {
    const flatText = text.replace(/\s/g, '');
    const searchTexts = [text, flatText];

    let maxCharge = 0; // 충전량 (소수점)
    let maxPrice = 0; // 금액 (정수)

    // --- A. 충전량 (kWh) 추출 ---
    const chargePatterns = [
        // 1. 충전량/용량 키워드 뒤의 소수점 숫자
        /충\s*전\s*량?[:\s(빠)]*([0-9]+\.[0-9]{1,4})/i,
        /용\s*량[:\s]*([0-9]+\.[0-9]{1,4})/i,
        // 2. kWh, kW, kwh, KWH, 공, ㅐwh 등 오인식 패턴 앞의 소수점 숫자
        /([0-9]+\.[0-9]{1,4})\s*k[w\s]?[h\s공ㅐ]{1,3}/i,
        // 3. 공백이 제거된 텍스트용 패턴
        /충전량[:\s( 빠)]*([0-9]+\.[0-9]{1,4})/i,
        /([0-9]+\.[0-9]{1,4})kwh/i,
    ];

    for (const searchText of searchTexts) {
        for (const pattern of chargePatterns) {
            const match = searchText.match(pattern);
            if (match) {
                const num = parseFloat(match[1]);
                if (!isNaN(num) && num > maxCharge) {
                    maxCharge = num;
                }
            }
        }
    }

    // --- B. 금액 (원) 추출 ---
    const pricePatterns = [
        /결\s*제\s*금\s*액[:\s(원)]*([0-9,]+)/i,
        /합\s*계[:\s(원)]*([0-9,]+)/i,
        /총\s*금\s*액[:\s(원)]*([0-9,]+)/i,
        /충\s*전\s*금\s*액[:\s(원)]*([0-9,]+)/i,
        // 공백 제거된 텍스트 패턴
        /결제금액[:\s(원)]*([0-9,]+)/i,
        /합계[:\s(원)]*([0-9,]+)/i,
        /총금액[:\s(원)]*([0-9,]+)/i,
        /충전금액[:\s(원)]*([0-9,]+)/i,
    ];

    for (const searchText of searchTexts) {
        for (const pattern of pricePatterns) {
            const match = searchText.match(pattern);
            if (match) {
                const numStr = match[1].replace(/,/g, '');
                const num = parseInt(numStr);
                if (!isNaN(num) && num > maxPrice) {
                    maxPrice = num;
                }
            }
        }
    }

    // 최종 결과 반환
    return { charge: maxCharge, price: maxPrice };
}

// =================================================================
// ⚙️ 3. API 요청에 필요한 추가 데이터 (번호, 시간, 이름) 추출 함수
// =================================================================
export function extractApiData(text) {
    const flatText = text.replace(/\s/g, '');

    const approveMatch =
        text.match(/주\s*문\s*번\s*호[:\s#]*(\d+)/i) ||
        text.match(/승인\s*번\s*호?[:\s]*(\d{4,16})/i) ||
        text.match(/거래\s*번\s*호?[:\s]*(\d{4,16})/i);

    // 자전거 번호 추출
    let bikeNumber = '';

    // 패턴 1: "자전거 번호 35719 3798" 형식 (두 숫자가 분리됨)
    const bikePattern1 = text.match(
        /자\s*전\s*거\s*번\s*호[:\s]*(\d+)\s+(\d+)/i
    );

    if (bikePattern1 && bikePattern1[2]) {
        // 두 번째 그룹이 있으면 첫 번째 숫자만 사용
        bikeNumber = bikePattern1[1]; // "35719"
    } else {
        // 패턴 2: 나머지 형식들
        const bikePattern2 =
            text.match(/(\d[-\s]?\d{3}[-\s]?\d{8,})\s*\([^)]*자\s*전\s*거/i) ||
            flatText.match(/(\d[-]?\d{3}[-]?\d{8,})\([^)]*자전거/i) ||
            text.match(/([A-Z]{3}[-\s]?\d{8,})/i) ||
            flatText.match(/([A-Z]{3}[-]?\d{8,})/i) ||
            text.match(/자\s*전\s*거\s*번\s*호?[:\s]*(\d{5,})/i) ||
            flatText.match(/자전거번호[:\s]*(\d{5,})/i) ||
            flatText.match(/D-\s*?(\d{5,})/i);

        if (bikePattern2) {
            bikeNumber = bikePattern2[1].replace(/[A-Z\s-]/gi, '').slice(-5);
        }
    }

    // 시간 추출
    let startTime = '';
    let endTime = '';

    const startTimeMatch1 = text.match(
        /대\s*여\s*시\s*간[:\s]*\d{4}[.\-/]\d{2}[.\-/]\d{2}\s*(\d{2}:\d{2})/i
    );
    const endTimeMatch1 = text.match(
        /반\s*납\s*시\s*간[:\s]*\d{4}[.\-/]\d{2}[.\-/]\d{2}\s*(\d{2}:\d{2})/i
    );

    if (startTimeMatch1 && endTimeMatch1) {
        startTime = startTimeMatch1[1];
        endTime = endTimeMatch1[1];
    } else {
        const dateTimePattern =
            /(\d{4}[-.\s]\d{2}[-.\s]\d{2})[^\d:]*(\d{2}:\d{2})/gi;
        const dateTimeMatches = [...text.matchAll(dateTimePattern)];

        if (dateTimeMatches.length >= 2) {
            startTime = dateTimeMatches[0][2];
            endTime = dateTimeMatches[1][2];
        } else {
            const allTimes = text.match(/(\d{1,2}:\d{2})/g) || [];
            const validTimes = allTimes.slice(1);
            startTime = validTimes[0] || '';
            endTime = validTimes[1] || '';
        }
    }

    const nameMatch =
        text.match(/매\s*장\s*명[:\s]*([가-힣a-zA-Z\s]{2,20})/i) ||
        text.match(/[가-힣a-zA-Z]{2,}\s*(주|센터|점|소|샵|스토어|마켓)/);

    let finalName = '미확인 상호';
    if (nameMatch) {
        finalName = (nameMatch[1] || nameMatch[0])
            .replace(/\s+/g, '')
            .replace(/\n/g, '') // 줄바꿈 제거
            .trim() // 앞뒤 공백 제거
            .replace(/샵/g, '');
    }
    return {
        approveNum: approveMatch ? approveMatch[1] : '',
        bike_number: bikeNumber,
        startTime: startTime,
        endTime: endTime,
        name: finalName,
    };
}
