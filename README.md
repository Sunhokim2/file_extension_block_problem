# 파일 확장자 차단 서비스 - 플로우 개발과제

##  프로젝트 소개

이 프로젝트는 사용자가 파일 확장자를 체크/언체크를 통해 차단하거나 직접입력하여 차단할 수 있고 파일업로드 버튼으로 제대로 차단되었는지를 확인할 수 있는 간단한 웹사이트입니다.

| 항목 | 상세 |
| :--- | :--- |
| **EC2 배포 주소** | http://13.124.49.85/ |
| **프론트엔드** | React Vite, Styled-component, TypeScript |
| **백엔드** | Spring Boot, JAVA21 |
| **DB** | PostgreSQL |
| **배포** | DockerHub, AWS EC2 |

---

### ERD
<img width="348" height="146" alt="image" src="https://github.com/user-attachments/assets/2adb215d-77c4-440a-b22a-84bcf36545f7" />

---

### 목차

1.  [핵심 기능 및 구현 상세](#핵심-기능-및-구현-상세)

2.  [⭐추가 고려 사항 (프로젝트 개선점)⭐](#-추가-고려-사항-프로젝트-개선점)

3.  [실행 및 배포 방법](#-⚙️-실행-및-배포-방법)

---

---

##  핵심 기능 및 구현 상세

제시된 핵심 요구사항 3가지에 대해 실제 프로젝트 코드에서 어떻게 구현했는지 상세히 설명합니다.

### 1. 고정 확장자 관리

| 요구사항 | 구현 방식 및 설명 |
| :--- | :--- |
| **1-1.** 차단을 자주 하는 확장자 리스트, `default`는 unCheck. | `ExtensionService.FIXED_EXTENSIONS` (`Set.of` 사용)에 `bat`, `cmd`, `exe`, `js` 등 7개 확장자를 정의했습니다. DB 초기화 시 (`@PostConstruct`) `checked` 상태를 `false`로 저장합니다. |
| **1-2.** check/uncheck 시 DB에 저장 및 새로고침 유지. | 1. 프론트엔드(`FixedExtensionList.tsx`)에서 체크박스 변경 시 `fetch`를 통해 백엔드 `/api/fixed/update`로 `name`과 `checked` 상태를 전송합니다.<br>2. 백엔드 (`ExtensionService.updateFixedExtension`)에서 `@Transactional`을 적용하여 DB에 상태를 즉시 반영하므로, 새로고침 시에도 `ExtensionService.getFixedExtensions()`를 통해 최신 상태를 불러옵니다. |

### 2. 커스텀 확장자 추가

| 요구사항 | 구현 방식 및 설명 |
| :--- | :--- |
| **2-1.** 확장자 최대 입력 길이 20자리. | **유효성 검증:** <br> `CustomExtensionDto`에 `@Size(max = 20)` 어노테이션을 적용하고, `ExtensionController`에서 `@Valid` 및 `BindingResult`를 통해 서버 단에서 입력 길이 20자리를 보장합니다. |
| **2-2.** 추가 버튼 클릭 시 DB 저장 및 아래 영역에 표현. | **RESTful API 설계:**<br>1. 프론트엔드(`CustomExtensionManager.tsx`)에서 입력값을 `FormData`로 구성하여 `/api/custom/add`로 **`POST` 요청**을 보냅니다.<br>2. 백엔드 (`ExtensionController.addCustomExtension`)는 저장 후 `201 Created` 상태 코드와 함께 **저장된 객체(`Extension`)**를 JSON 응답합니다.<br>3. 프론트엔드는 이 응답을 받아 상태(`customExtensions`)를 업데이트하여 UI에 즉시 반영합니다. |

### 3. 커스텀 확장자 관리

| 요구사항 | 구현 방식 및 설명 |
| :--- | :--- |
| **3-1.** 최대 200개까지 추가 가능. | `ExtensionService.addCustomExtension` 메서드에서 `getCustomExtensionCount()`를 통해 현재 개수가 `MAX_CUSTOM_EXTENSIONS (200)`을 초과하는지 확인하고, 초과 시 `IllegalStateException`을 발생시켜 등록을 차단합니다. |
| **3-2.** 확장자 옆 X 클릭 시 DB에서 삭제. | 1. 프론트엔드에서 확장자의 `id`를 백엔드 `/api/custom/delete`로 전송합니다.<br>2. 백엔드 (`ExtensionService.deleteCustomExtension`)에서 `id`와 `ExtensionType.CUSTOM`을 확인하여 해당 데이터를 DB에서 삭제합니다 (`deleteByIdAndType` 사용). |

---

## ⭐ 추가 고려 사항 (프로젝트 개선점)⭐

기본 요구사항 외에, 서비스의 안정성, 보안, 확장성을 고려하여 다음 사항들을 추가로 구현했습니다.

### 1. 데이터 관리
* **테이블 통합 설계:** `고정 확장자`와 `커스텀 확장자`를 하나의 `extensions` 테이블로 통합하고 `type` 컬럼(`FIXED` / `CUSTOM`)으로 구분했습니다.
    * **통합 이유:** 확장자가 차단되었는지 확인하는 핵심 비즈니스 로직(`isExtensionBlocked`)이 하나의 쿼리(`existsByNameAndChecked`)로 처리되어야 성능적으로 더 좋다고 판단했습니다. 두 테이블로 분리할 경우, 차단 여부 확인 시 JOIN 또는 두 번의 쿼리 요청이 필요하여 오버헤드가 발생할 수 있습니다. 
**<u>또한, 이 과제가 규모가 크지 않은 서비스임을 고려하여 데이터베이스 정규화를 칼같이 지키기보다 성능과 단순성을 우선했습니다.</u>**

* **커스텀 확장자 중복 체크:** 새로운 확장자 등록 시, 고정 확장자 목록을 포함하여 **DB 전체에서 중복 여부**를 확인하여 이미 등록된 확장자 등록을 차단했습니다 (`ExtensionRepository.existsByName`).

* **파일 확장자 유효성:** `CustomExtensionDto`에서 `@Pattern(regexp = "^[a-zA-Z0-9]+$")`를 사용해 확장자 이름이 영문자와 숫자 외에 다른 문자를 포함하는 것을 방지했습니다.

* **변경 추적 (`changedByIP`):** 확장자 상태 변경 및 등록 시, `X-Visitor-ID` 헤더를 통해 받은 클라이언트 식별용 UUID와 변경된 시각을 `changedByIP`와 `changedAt` 필드에 기록하여 누가, 언제 변경했는지 추적할 수 있도록 구현했습니다.

### 2. 배포 안정성

* **컨테이너 기반 배포 (Docker Compose):** 백엔드, 프론트엔드, DB를 컨테이너화하여 환경 의존성을 제거하고 일관된 배포 환경을 구축했습니다.


### 3. 사용자 경험 및 기능

* **파일 업로드 시뮬레이션:** `/api/upload` API를 통해 실제 파일 업로드가 발생했을 때 차단 로직 (`isExtensionBlocked`)이 정상 동작하는지 테스트할 수 있는 기능을 제공했습니다.

---

## ⚙️ 실행 및 배포 방법
본 프로젝트는 Docker를 기반으로 하며, 아래의 3단계 절차를 통해 AWS EC2 환경에 배포됩니다.
### 1. 저장소 클론

```
git clone https://github.com/Sunhokim2/file_extension_block_problem
```

### 2. DockerHub에 이미지 빌드 및 푸시
로컬에서 미리 이미지를 빌드 후 푸시합니다.

```
# 백엔드 이미지 빌드
docker build -t [Your_DockerName]/backend_fileblock:latest ./backend_fileblock

# Docker Hub에 푸시
docker push [Your_DockerName]/backend_fileblock:latest

# 프론트엔드 이미지 빌드
docker build -t [Your_DockerName]/frontend_fileblock:latest ./frontend_fileblock

# Docker Hub에 푸시
docker push [Your_DockerName]/frontend_fileblock:latest
```

### 3. Docker Compose 실행

EC2 환경에서 다음 명령을 실행합니다. (사전에 Docker Hub에 이미지가 푸시되어 있어야 합니다.)

```
# 환경 변수 파일 .env를 docker-compose.yml과 같은 루트에 준비 (DB_PASSWORD 포함)
# 모든 컨테이너 실행
sudo docker-compose up -d

# 서비스 상태 확인
sudo docker-compose ps

