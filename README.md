# DEWS · 이슬청년부

도원동교회 이슬청년부의 출석·돌봄·소그룹 관리 플랫폼입니다. React / TypeScript / Vite 화면과 Docker 기반 로컬 Supabase 인증·DB를 연결했습니다. 현재는 합성 인원 150명으로 검증하는 개발 환경이며 외부 운영 배포는 하지 않았습니다.

## 실행

Windows Node 24, pnpm, 실행 중인 Docker Desktop이 필요합니다.

```sh
pnpm install
pnpm db:start
pnpm db:migrate
pnpm seed:accounts
pnpm dev
```

최초 로컬 DB 생성 시 seed.sql이 적용됩니다. 기존 DB에는 migration만 적용하세요. `supabase db reset`은 현재 데이터를 지우므로 일반 실행 절차가 아닙니다. 계정 스크립트는 로컬 주소만 허용하며 `.env.local`에 공개 클라이언트 설정만 생성합니다. 기존 계정의 변경된 비밀번호는 초기화하지 않습니다.

화면: http://127.0.0.1:5173/ · DB 관리: http://127.0.0.1:54323/

```sh
pnpm test
pnpm test:integration
pnpm build
```

통합 테스트는 로컬 가상 DB 전용이며 시험용 기록을 생성·정리합니다. 실제 데이터를 넣지 마세요.

## 구현 범위

로그인 및 초대, 역할별 메뉴와 서버 권한, 회원·교육·상태 이력, 예배/소그룹 통합 출석, 돌봄 기록과 확인 대상, 편성 초안/수동 조정/예약 전환, 행사 포스터와 캘린더, 동아리, 익명 공개·비공개 게시판과 댓글을 구현했습니다.

## 문서

- [운영 요구사항](docs/PRODUCT_SPEC.md)
- [기술·비용 결정](docs/TECH_DECISION.md)
- [완료 범위와 남은 작업](docs/IMPLEMENTATION_STATUS.md)
- [역할별 테스트 계정](docs/TEST_ACCOUNTS.md)
- [테스트 진행 순서](docs/TEST_GUIDE.md)
- [실제 통합 테스트 결과](docs/TEST_RESULTS.md)

## 저장 위치와 배포

현재 코드는 Windows의 이 프로젝트 폴더에 저장됩니다. WSL 프로젝트가 아닙니다. Docker는 로컬 DB·인증 검증용이며 프런트엔드는 Node로 실행합니다. GitHub에는 커밋한 소스만 저장하고 `.env.local`, `.local`, node_modules는 제외합니다. OneDrive 동기화 충돌을 피하려면 추후 별도 개발 폴더나 WSL 홈으로 옮기는 편이 좋습니다.

클라우드 연결·실제 명단 이전·운영 백업·알림톡은 아직 진행하지 않았습니다. 자세한 제약은 구현 현황 문서를 확인하세요.
