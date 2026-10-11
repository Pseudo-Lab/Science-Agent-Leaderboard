# Science Agent Leaderboard

OpenAI GPT 기반 Agent가 과학 문제를 어떻게 해결하는지를 평가하는 Leaderboard 프로젝트입니다.

---

## 📌 프로젝트 개요

최근 LLM 기반 Agent가 빠르게 발전하고 있지만,  
단순한 모델 성능이 아닌 **Agent 설계 방식(Workflow, Tool usage, Cost, Reproducibility)**을 
체계적으로 평가할 수 있는 환경은 아직 부족합니다.

본 프로젝트는 다음을 목표로 합니다:

- Agent 기반 과학 문제 해결 능력 평가
- Benchmark 및 Evaluation 체계 설계
- Leaderboard 플랫폼 구축

---

## 🖥️ 대시보드 미리보기

공개 대시보드는 모델 순위, 조건별 성능 비교, Standard/Pro 결과를 한 화면에서 탐색할 수 있도록 구성했습니다. 공개가 승인된 집계 정보만 표시하며, 평가 매트릭과 내부 채점 설정은 포함하지 않습니다.

![Science Agent Leaderboard 대시보드](docs/assets/dashboard-overview.png)

---

## 🎯 프로젝트 목표 (MVP)

초기 2주 목표:

- 하나의 Challenge(Task) 정의
- Agent 실행 환경 구축
- 기본 Evaluation Metric 설계
- 간단한 Leaderboard 구성

---

## 🧠 우리가 평가하는 것

이 프로젝트는 “모델 성능”이 아니라  
👉 **Agent 설계 능력**을 평가합니다.

주요 평가 요소:

- Correctness (정답 정확도)
- Tool Usage (도구 활용)
- Cost (비용 효율성)
- Reproducibility (재현성)

---

## 🔄 공개 실행 파이프라인

Leaderboard 결과는 다음 흐름으로 생성됩니다.

```text
Task 정의
  → 독립 실행 환경 준비
  → Agent 실행
  → 산출물 및 스키마 검증
  → 공식 지표 확인
  → 공개용 데이터 생성
  → Leaderboard 반영
```

파이프라인은 다음 원칙을 따릅니다.

- 각 실행은 별도의 작업 공간과 실행 식별자를 사용합니다.
- 이전 실행의 대화, 응답 또는 세션 상태를 다음 실행에 재사용하지 않습니다.
- 실행 전에 모델, 도구 모드, 런타임 및 의존성 조건을 검증합니다.
- 생성된 프로그램에는 API Key 등 비밀 환경변수를 전달하지 않습니다.
- 산출물 스키마와 공식 지표가 모두 유효한 실행만 결과로 인정합니다.
- 중단된 실행은 성공한 결과를 보존한 상태에서 조건별로 재개할 수 있습니다.

---

## 🛠️ 파이프라인 고도화

초기 검증 과정에서는 긴 추론 응답이 출력 예산에 도달하거나 API 요청이 제한 시간 안에 완료되지 않는 경우가 확인되었습니다. 또한 하위 프로세스가 종료 코드 `0`을 반환하더라도 최종 지표가 생성되지 않은 실행이 성공으로 집계될 수 있었습니다.

현재 파이프라인은 다음과 같이 보완되어 있습니다.

- 출력 예산, API 제한 시간, 재시도 정책을 고정된 실행 규약으로 관리합니다.
- 단순 API 응답 성공이 아니라 실행, 출력 스키마, 공식 지표를 함께 확인합니다.
- 지표가 없거나 유효하지 않으면 해당 실행을 실패로 처리합니다.
- 실패 단계와 사유를 구분해 기록하고 첫 실패에서 안전하게 중단합니다.
- 재개 시 실행 규약과 입력 버전의 일치 여부를 확인합니다.
- 모든 시도는 로컬 감사 기록에 남기되 공개 결과에는 승인된 집계 정보만 포함합니다.

이 변경으로 실행 오류가 정상 결과처럼 표시되는 문제를 방지하고, 반복 실행의 재현성과 추적성을 높였습니다.

---

## 🔒 공개 데이터 및 보안 정책

공개 Leaderboard에는 결과 비교에 필요한 최소 정보만 포함합니다.

**공개 가능한 정보**

- 모델과 Task의 공개 식별자
- 버전 정보
- 공식 집계 점수
- 실행 수, 지연 시간 및 토큰 사용량 요약
- 결과 적격 상태

**공개하지 않는 정보**

- API Key, 인증정보 및 계정 정보
- 원시 API 요청과 응답
- 전체 Prompt와 내부 실행 로그
- Gold label과 비공개 정답 데이터
- 평가 매트릭과 내부 scoring 설정
- Evaluator 내부 진단 정보
- 로컬 파일 경로와 개인 식별 정보

원시 산출물은 로컬 검증과 감사 목적으로만 보관합니다. 공개 데이터는 허용 목록 방식으로 별도 생성하며, 전체 실행이 검증 기준을 통과하지 않으면 게시하지 않습니다.

---

## 🧩 프로젝트 구조

- /challenges   → 문제 정의 (Benchmark)
- /evaluation   → 평가 로직 (Metrics, Scoring)
- /leaderboard  → 결과 저장 및 랭킹
- /docs         → 설계 문서 및 논의
- /examples     → 샘플 입력/출력

---

## 👥 팀 구성 및 역할

### 공준호
- Project Lead / Architect
- Benchmark 방향 및 구조 정의
- Leaderboard 설계

### 김보금
- Benchmark Designer
- Challenge(Task) 설계
- 문제 구조 정의

### 김가영
- Evaluation Lead
- Metric 설계
- Scoring 및 Execution Pipeline

### 박진우
- Benchmark Research
- Dataset 및 기존 benchmark 조사
- 문서화 및 분석 지원

---

## ⚙️ 프로젝트 진행 방식

- GitHub Issue 기반으로 작업 진행
- 각 영역별 Owner 중심으로 설계 및 구현
- 논의는 자유롭게 하되, 최종 결정은 Owner 기준으로 정리

### 주간 작업 연결 보드

각 팀의 주간 작업 Issue를 작성하면 보드에서 선행 자료, 전달 예정 팀,
다른 주차로 이어지는 작업을 확인할 수 있습니다. GitHub에서 수정하고 보드의
새로고침으로 반영합니다.

- [주간 작업 작성·연동 가이드](docs/weekly-work.md)
- [5개 팀 Issue 양식](.github/ISSUE_TEMPLATE)
- [읽기 전용 보드 소스](tools/team-board)

---

## 📊 현재 진행 단계

- [x] 팀 구성
- [x] 역할 정의
- [x] 공개 Challenge 초안 설계
- [x] Evaluation Framework 설계
- [x] 독립 실행 Pipeline 구축 및 고도화
- [x] Leaderboard MVP 구현
- [ ] 과학 Task 및 모델 범위 확장

---

## 🚀 향후 방향

- 다양한 과학 문제 확장
- multi-agent benchmark 도입
- 지속적인 Leaderboard 운영

또한 Andrej Karpathy의 **AutoResearch 개념을 기반으로 한  
Autonomous Research Agent 구조도 향후 적용을 고려하고 있습니다.**

---

## 🤝 참여 방법

- Issue 확인 후 참여 가능
- Discussion 및 PR 환영합니다
