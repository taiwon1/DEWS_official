# 로컬 통합 검증 결과

실행: 2026-11-13T00:34:19.615Z

- PASS: 19 seed accounts authenticate and load server-filtered snapshots
- PASS: anonymous session and direct table reads/writes denied
- PASS: member response contains no contacts of others, notes or author identity
- PASS: leader scope, deputy attendance-only and secretary pastor-private exclusion
- PASS: all seven officer positions can read private board but not pastoral notes
- PASS: private post/comment persist and unauthorized comments are denied
- PASS: public post/comment visible to all logged-in roles
- PASS: attendance two meetings, optimistic conflict, deputy and scope checks
- PASS: education distinct lessons, six-month eligibility and group assignment
- PASS: 2/4/26-week alerts and unknown weeks are not absences
- PASS: long absence, expulsion, reinstatement and rights are separate audited operations
- PASS: care date, author-only update/delete and visibility escalation denial
- PASS: contact corrections require officer authority and persist
- PASS: event and club management restricted to officers/pastors
- PASS: plan draft, future reservation, duplicate/education guards and cancel
- PASS: group reorganization is atomic and transfers record access (SQL rollback fixture)
- PASS: role removal is immediate even with an existing login token
- PASS: invite issue, single use claim and password login

테스트가 만든 데이터는 정리하고 원래 출석·상태를 복원합니다. 외부 배포/무료 플랜 SLA/운영 데이터 이전 검증은 포함하지 않습니다.
