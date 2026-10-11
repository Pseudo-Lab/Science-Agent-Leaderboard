# 팀 작업과 누적 활동 보드

GitHub Issue가 작업의 원본입니다. 모든 주차의 작업을 한곳에서 보고, 실제 업데이트한 사람과 변경 전후, 다른 팀에 전달할 내용을 따라갑니다.

## 처음 사용하는 팀원

1. 보드의 **+ 작업 기록** 또는 [새 Issue](https://github.com/Pseudo-Lab/Science-Agent-Leaderboard/issues/new/choose)에서 팀 양식을 선택합니다.
2. 주차, 질문·목표, 작업·결과 요약, 완료 기준을 작성합니다. 주차는 참고 정보이며 보드를 나누지 않습니다. 담당자는 Assignees로 지정합니다. 미지정 시 작업 작성자가 담당 위치에 표시됩니다.
3. `자료 링크`에는 공개 문서·PR·결과의 http(s) URL을 한 줄에 하나씩 입력합니다.
4. `선행 Issue`에 필요한 자료를 만드는 **같은 저장소** Issue의 `#번호` 또는 전체 URL을 입력합니다. 여러 번호는 공백·줄바꿈·쉼표로 구분하고, 없으면 비워둡니다.
5. `영향받는 팀`, `전달 내용·요청할 결정`을 적어 다음 사람이 할 일을 연결합니다.
6. 진행하며 본문의 상태와 결과를 수정하고 댓글로 논의합니다. 중요한 결정은 본문에도 반영합니다. 같은 작업이 이어지면 기존 Issue를 업데이트하고, 새 질문이면 새 Issue를 만들고 이전 Issue를 선행 자료로 연결합니다.

| 팀 | 작성할 핵심 내용 |
| --- | --- |
| Task·데이터 | 문제·입력 데이터·요구 산출물·성공 조건 |
| 연구·실험 설계 | 연구 근거·가설·비교 변수·고정 조건 |
| Agent·Harness | 구현 변경·실행 조건·코드 PR·실행 요약 |
| Evaluation | 검증 결과·실패 유형·효과·비용·한계 |
| Leaderboard | 저장·조회·비교 기능·필요한 데이터 형식 |

## 화면 읽는 법

- **실시간 활동**: 등록·수정·종료·재개·담당자 변경·댓글 활동을 날짜순으로 누적합니다. GitHub 계정, 변경 항목의 전후, 영향받는 팀을 표시합니다. 팀·업데이트자·활동 유형·검색으로 좁힐 수 있습니다. 오래된 활동은 `이전 활동 더 보기`로 이어 봅니다.
- **팀 흐름**: 모든 주차의 작업을 팀별로 모아 봅니다. 작업을 선택하면 선행 자료와 그 결과를 사용하는 후속 Issue를 확인합니다.
- **다음 작업**: 선행 자료 대기, 다른 팀에 전달할 내용, 결과에서 이어갈 질문을 모읍니다. 공유 전인 전달 요청은 별도로 표시합니다.
- 오른쪽 상세는 **현재 Issue 내용**입니다. 활동 피드의 변경 전후는 해당 시점의 기록입니다. 담당자와 업데이트자는 서로 다를 수 있습니다.

`공유 완료`이며 중단되지 않은 Issue만 준비된 자료로 판단합니다. Issue를 닫는 것만으로 완료가 되지 않습니다. `not_planned`로 닫으면 중단입니다. 찾을 수 없는 선행 자료도 대기로 표시합니다. 전달 예정 팀은 실제 후속 Issue와 구분하며, 팀 관계를 임의 추정하지 않습니다.

## 관리자: 활성화

1. 이 변경을 **기본 브랜치(main)에 병합**합니다. Issue Forms와 Issue 이벤트 워크플로는 기본 브랜치에 있어야 동작합니다.
2. 저장소 Actions 정책에서 `Record team activity` 실행 및 GITHUB_TOKEN의 `contents: write` 사용을 허용해야 합니다. 사용자 토큰이나 별도 Secret은 필요하지 않습니다.
3. Actions에서 `Record team activity` → `Run workflow`를 한 번 실행하면 빈 기록 저장소가 초기화됩니다. 수동 실행을 생략해도 첫 번째 대상 Issue 이벤트에서 자동 생성됩니다.
4. `team-activity-data` 브랜치의 `feed.json`이 생성되는지 확인합니다. 이 브랜치는 데이터 전용이며 main에 병합할 필요가 없습니다.
5. 팀 Issue를 수정한 뒤 Actions 성공과 보드 반영을 확인합니다. 실패한 실행은 원인을 해결한 뒤 재실행할 수 있으며, 같은 run ID는 중복 저장하지 않습니다.

**과거 수정 이력은 소급 복원하지 않습니다.** 워크플로 활성화 이후 수신된 이벤트부터 기록합니다. 기존 Issue의 현재 상태는 즉시 표시하지만 작성자를 마지막 수정자로 추정하지 않습니다. Actions 실패·비활성화 중 수신되지 않은 변경은 자동 복구되지 않으므로 Actions 실행 상태를 확인해주세요.

## 갱신과 기록 방식

- 사이트가 열려 있을 때 **5분마다** 공개 GitHub Issues API와 공개 활동 JSON을 읽습니다. 푸시나 초 단위 실시간 통신이 아닙니다. GitHub Actions 처리·raw 파일 캐시로 추가 지연이 있을 수 있습니다. 즉시 확인하려면 새로고침을 누릅니다.
- 자동 갱신을 끌 수 있고, 숨겨진 탭에서는 중지합니다. 오류 시 자동 재시도 간격을 최대 20분으로 늘립니다. 마지막 성공 자료를 유지하고 조회 실패를 표시합니다.
- 작업과 활동은 각각 독립적으로 갱신합니다. 오른쪽 패널의 시각은 현재 Issue의 갱신 시각과 **마지막으로 수집한 Issue 이벤트의 사람**을 구분합니다. 댓글은 별도 활동입니다.
- 실제 변경자는 웹훅의 `sender.login`입니다. Issue·댓글 작성자나 Assignees를 수정자로 사용하지 않습니다. 이벤트에 정확한 시각이 없으면 수집 시각이라고 표시합니다.
- 알려진 양식 필드와 제목 변경, 댓글 요약만 저장합니다. 변경 항목별 전후 최대 1,400자입니다. 전체 GitHub 변경 내역의 대체 백업은 아닙니다.
- 기록은 데이터 브랜치에 누적되므로 사이트를 닫아도 보존됩니다. 댓글·Issue를 삭제하더라도 이미 수집된 요약은 남으며 삭제 이벤트를 추가합니다. 잘못 공개한 정보는 GitHub Issue뿐 아니라 데이터 브랜치와 그 Git 기록에서도 별도 정리해야 합니다.
- 동시에 실행된 기록 작업은 강제 push 없이 새 HEAD를 읽어 재시도합니다. GitHub concurrency 그룹에 의해 대기 이벤트가 취소되지 않도록 그룹을 사용하지 않습니다.
- 열린/닫힌 Issue를 모두 페이지별 조회하며 PR은 제외합니다. 2,000개를 초과하거나 일부 페이지가 실패하면 부분 결과를 완료로 표시하지 않습니다.

## 공개 범위

공개 저장소용 보드입니다. 저장소의 공개 정책에 맞춰 공개 가능한 요약·코드·집계 링크만 작성합니다. 원시 로그, 전체 Prompt, Gold label, 내부 채점 설정, 인증정보, 개인 식별 정보는 Issue나 댓글·첨부에 넣지 않습니다. 양식과 보드에 개인 실명이나 고정 계정 배정은 포함하지 않습니다. 인증 토큰을 브라우저에 넣지 않습니다. 저장소를 비공개로 전환하려면 인증된 서버 연동이 별도로 필요합니다. 사이트 접근 범위는 저장소 공개 범위와 별개입니다.

## 개발·배포

`tools/team-board/index.html`, `style.css`, `board-core.js`, `app.js`를 함께 정적 호스팅합니다. 외부 빌드 의존성은 없습니다. 단일 HTML 생성:

```sh
node tools/team-board/package-standalone.cjs /absolute/path/team-flow.html
```

Issue 데이터 변경은 사이트 재배포 없이 반영됩니다. 화면·파서 변경에는 재배포가 필요합니다. 워크플로는 기본 브랜치 코드만 checkout하며 Issue 내용을 명령어로 실행하지 않습니다.

```sh
node --test tools/team-board/board-core.test.cjs tools/team-board/activity-writer.test.cjs
node --check tools/team-board/app.js
node tools/team-board/generate-forms.cjs
```

검증 범위: 양식·의존 관계·중단 상태·안전한 링크·페이지네이션·실제 수정자·필드별 차이·동시 기록 충돌·재실행 중복 방지·수집 미설정/오류 구분.

참고: [Issue Forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms), [Issue 이벤트](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#issues), [워크플로 동시 실행](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).
