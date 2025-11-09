import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * 이미지를 Firebase Storage에 업로드하고 URL을 반환합니다.
 * @param {File} file - 업로드할 이미지 파일
 * @param {string} folder - 저장할 폴더 경로 (예: 'badges', 'challenges')
 * @returns {Promise<string>} 업로드된 이미지의 다운로드 URL
 */
export async function uploadImageToFirebase(file, folder = 'badges') {
    try {
        // 파일명 생성 (타임스탬프 + 랜덤 문자열 + 원본 파일명)
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 9);
        const fileName = `${folder}/${timestamp}_${randomString}_${file.name}`;
        
        // Storage 참조 생성
        const storageRef = ref(storage, fileName);
        
        // 파일 업로드
        const snapshot = await uploadBytes(storageRef, file);
        
        // 업로드된 파일의 다운로드 URL 가져오기
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log('✅ 이미지 업로드 성공:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('❌ 이미지 업로드 실패:', error);
        throw new Error('이미지 업로드에 실패했습니다: ' + error.message);
    }
}

