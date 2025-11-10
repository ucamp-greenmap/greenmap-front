# 🤝 협업 가이드

Green Map 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하기 위한 가이드라인을 제공합니다.

## 📋 목차

- [브랜치 전략](#브랜치-전략)
- [Git 커밋 컨벤션](#git-커밋-컨벤션)
- [Pull Request 가이드](#pull-request-가이드)
- [코드 스타일](#코드-스타일)
- [이슈 리포트](#이슈-리포트)

## 🌳 브랜치 전략

### 브랜치 구조

```
main (production)
  └── dev (development)
      ├── feat/feature-name (새 기능)
      ├── fix/bug-name (버그 수정)
      ├── refactor/refactor-name (리팩토링)
      ├── hotfix/issue-name (긴급 수정)
      └── chore/task-name (기타 작업)
```

### 브랜치 명명 규칙

브랜치명은 `타입/설명` 형식을 따릅니다.

#### 타입 종류

- **feat/**: 새 기능 추가
  - 예: `feat/user-authentication`, `feat/map-cluster`
- **fix/**: 버그 수정
  - 예: `fix/login-error`, `fix/marker-display`
- **refactor/**: 코드 리팩토링 (기능 변경 없음)
  - 예: `refactor/modal-component`, `refactor/api-structure`
- **chore/**: 빌드, 설정 등 기타 작업
  - 예: `chore/update-dependencies`, `chore/add-eslint`
- **hotfix/**: 프로덕션 긴급 수정
  - 예: `hotfix/critical-bug`, `hotfix/security-patch`
- **docs/**: 문서 수정
  - 예: `docs/update-readme`, `docs/add-api-docs`
- **style/**: 코드 스타일 변경 (로직 변경 없음)
  - 예: `style/format-code`, `style/fix-indentation`
- **test/**: 테스트 코드 추가/수정
  - 예: `test/add-unit-tests`, `test/fix-integration-tests`

#### 명명 규칙

- 소문자 사용
- 하이픈(`-`)으로 단어 구분
- 간결하고 명확하게 작성
- 한국어 대신 영어 사용 권장

### 브랜치 워크플로우

1. **기능 개발 시작**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/feature-name
   ```

2. **작업 완료 후 커밋**
   ```bash
   git add .
   git commit -m "feat: 새 기능 추가"
   ```

3. **원격 저장소에 푸시**
   ```bash
   git push origin feat/feature-name
   ```

4. **Pull Request 생성**
   - GitHub에서 `dev` 브랜치로 PR 생성
   - 코드 리뷰 후 머지

5. **dev 브랜치 머지 후 main 배포**
   - `dev` 브랜치에서 테스트 완료 후
   - `main` 브랜치로 머지하여 프로덕션 배포

## 📝 Git 커밋 컨벤션

### 커밋 메시지 형식

커밋 메시지는 다음 형식을 따릅니다:

```
<type>: <subject>

<body>

<footer>
```

### 타입 (Type)

커밋 타입은 브랜치 타입과 동일합니다:

- **feat**: 새 기능 추가
- **fix**: 버그 수정
- **refactor**: 코드 리팩토링
- **chore**: 빌드, 설정 등 기타 작업
- **docs**: 문서 수정
- **style**: 코드 스타일 변경 (로직 변경 없음)
- **test**: 테스트 코드 추가/수정
- **perf**: 성능 개선
- **ci**: CI/CD 설정 변경
- **build**: 빌드 시스템 변경

### 제목 (Subject)

- 50자 이내로 작성
- 첫 글자는 대문자 (선택사항)
- 마침표(.) 사용 금지
- 명령형 문장 사용
- 한국어 또는 영어 사용 가능 (일관성 유지)

#### 좋은 예

```
feat: 사용자 인증 기능 추가
fix: 로그인 오류 수정
refactor: 모달 컴포넌트 구조 개선
chore: 의존성 패키지 업데이트
```

#### 나쁜 예

```
feat: 사용자 인증 기능을 추가했습니다.
fix: login error
update: 코드 수정
```

### 본문 (Body)

- 선택사항이지만, 변경 사항이 복잡한 경우 작성 권장
- 72자마다 줄바꿈
- 무엇을, 왜 변경했는지 설명
- 어떻게 변경했는지는 코드로 설명 가능하면 생략

#### 예시

```
feat: 마커 클러스터 기능 추가

맵에 많은 마커가 표시될 때 성능 저하를 방지하기 위해
마커 클러스터링 기능을 추가했습니다.

- 카카오 맵 클러스터 라이브러리 연동
- 줌 레벨에 따라 마커 그룹화
- 클러스터 클릭 시 확대 기능
```

### 푸터 (Footer)

- 이슈 번호 참조 시 사용
- Breaking Change가 있는 경우 명시

#### 예시

```
feat: 사용자 인증 기능 추가

Closes #123
Refs #456
```

### 커밋 예시

#### 간단한 커밋

```
fix: 홈 화면의 로고 이미지 경로 수정
```

#### 상세한 커밋

```
refactor: 모달 컴포넌트 구조 개선

기존 모달 컴포넌트의 중복 코드를 제거하고 재사용 가능한
구조로 리팩토링했습니다.

- MessageModal 컴포넌트를 공통 컴포넌트로 분리
- 모달 상태 관리 로직 개선
- 성공/실패 타입별 처리 로직 추가

Closes #200
```

### 커밋 템플릿 사용하기

프로젝트에 커밋 메시지 템플릿이 포함되어 있습니다. 사용하려면 다음 명령어를 실행하세요:

```bash
git config commit.template .github/commit_template.txt
```

이후 `git commit` 명령어를 실행하면 템플릿이 자동으로 열립니다.

전역으로 설정하려면:

```bash
git config --global commit.template .github/commit_template.txt
```

> 💡 **참고**: 전역 설정 시 프로젝트 경로를 절대 경로로 지정해야 합니다.

## 🔄 Pull Request 가이드

### PR 생성 전 체크리스트

- [ ] 브랜치가 최신 `dev` 브랜치를 기준으로 생성되었는가?
- [ ] 커밋 메시지가 컨벤션을 따르는가?
- [ ] 코드가 정상적으로 작동하는가?
- [ ] 관련 이슈가 있다면 참조했는가?
- [ ] 불필요한 코드나 주석을 제거했는가?

### PR 작성 가이드

1. **제목**
   - 커밋 메시지와 유사한 형식
   - 변경 사항을 명확하게 표현

2. **설명**
   - 변경 사항 요약
   - 변경 이유
   - 테스트 방법
   - 관련 이슈 번호

3. **리뷰어 지정**
   - 최소 1명 이상의 리뷰어 지정
   - 팀원들의 코드 리뷰 요청

### PR 템플릿

PR 생성 시 다음 정보를 포함해주세요:

```markdown
## 변경 사항
- 변경 내용 1
- 변경 내용 2

## 변경 이유
변경 사항의 배경 및 이유를 설명해주세요.

## 테스트 방법
변경 사항을 테스트하는 방법을 설명해주세요.

## 스크린샷 (UI 변경 시)
스크린샷을 첨부해주세요.

## 관련 이슈
Closes #이슈번호
```

### PR 머지 규칙

1. **코드 리뷰 필수**
   - 최소 1명 이상의 승인 필요
   - 리뷰어의 요청사항 반영 후 머지

2. **충돌 해결**
   - 머지 전 충돌 해결 필수
   - `dev` 브랜치와 동기화 확인

3. **머지 방법**
   - Squash and merge 권장 (깔끔한 히스토리 유지)
   - 커밋 메시지는 PR 제목과 동일하게

## 💻 코드 스타일

### 일반 규칙

- **들여쓰기**: 2 spaces
- **따옴표**: Single quotes (`'`) 권장
- **세미콜론**: 사용하지 않음 (Prettier 설정에 따름)
- **줄 길이**: 100자 이내 권장

### 파일 구조

```
src/
├── components/     # 컴포넌트
├── screens/        # 화면 컴포넌트
├── hooks/          # 커스텀 훅
├── store/          # Redux store
├── api/            # API 호출
├── util/           # 유틸리티 함수
└── assets/         # 정적 파일
```

### 네이밍 컨벤션

- **컴포넌트**: PascalCase (예: `BadgeScreen.jsx`)
- **함수/변수**: camelCase (예: `getUserData`)
- **상수**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- **파일명**: 컴포넌트는 PascalCase, 나머지는 camelCase

### 컴포넌트 구조

```jsx
// 1. imports
import { useState } from 'react'
import { useDispatch } from 'react-redux'

// 2. 컴포넌트 정의
export const ComponentName = () => {
  // 3. hooks
  const [state, setState] = useState()
  const dispatch = useDispatch()

  // 4. 함수
  const handleClick = () => {
    // ...
  }

  // 5. render
  return <div>...</div>
}
```

## 🐛 이슈 리포트

### 버그 리포트

버그를 발견하셨다면 다음 정보를 포함해주세요:

- **버그 설명**: 무엇이 문제인지
- **재현 방법**: 어떻게 재현할 수 있는지
- **예상 동작**: 무엇이 예상되는 동작인지
- **실제 동작**: 실제로 무엇이 발생하는지
- **스크린샷**: 가능하면 스크린샷 첨부
- **환경**: 브라우저, OS 등

### 기능 제안

새로운 기능을 제안하시려면:

- **기능 설명**: 무엇을 원하는지
- **사용 사례**: 왜 필요한지
- **대안**: 고려한 대안이 있다면

## 📚 추가 리소스

- [React 공식 문서](https://react.dev/)
- [Redux Toolkit 문서](https://redux-toolkit.js.org/)
- [Tailwind CSS 문서](https://tailwindcss.com/)
- [Git 공식 문서](https://git-scm.com/doc)

## ❓ 문의사항

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

**Happy Coding! 💚**

