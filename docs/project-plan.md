# 팀 프로젝트 설계 문서

## 1. 팀 정보

- 팀원: 김예준, 최재우
- 서비스 이름: 코딩 to-do-list
- 한 줄 설명: 이 서비스는 코딩을 하는 사용자가 과제나 영상 링크를 저장하고 싶은 상황에서 쉽게 찾고 저장 할 수 있게 돕는다.

## 2. 브레인스토밍

### 아이디어 1

- 사용자:학생/개발자
- 상황: 리스트에 적혀있는 것을 지우고 싶다.
- 액션: 학생/개발자가 리스트를 삭제한다

### 아이디어 2

- 사용자:학생
- 상황: 코딩 영상 링크를 저장하고 싶어한다.
- 액션: 학생이 코딩 영상 링크를 리스트에 적어 저장한다.

### 아이디어 3

- 사용자:개발자
- 상황: 과제가 추가되었다.
- 액션: 개발자가 과제가 있는 리스트에 수정한다

## 3. 액션 아이템

### 액션 아이템 1

- 사용자 액션: 영상 링크를 리스트에 작성한다
- 서버가 해야 할 일: 영상 링크를 저장한다
- 저장할 데이터: 제목, 내용, 작성자명
- 후보 테이블: video_posts

### 액션 아이템 2

- 사용자 액션: 과제가 있는 리스트를 수정한다
- 서버가 해야 할 일: 글의 내용을 바꾼다.
- 저장할 데이터: 바뀐 제목, 내용
- 후보 테이블: list_posts

### 액션 아이템 3

- 사용자 액션: 리스트를 삭제한다
- 서버가 해야 할 일: 리스트 삭제한다
- 저장할 데이터: 제목, 내용, id
- 후보 테이블: list_posts, video_posts

## 4. DB 스키마

### 테이블 1

테이블명: list_posts
설명: 텍스트 리스트를 저장한다.

컬럼:
[id]: text, PK, not null
[컬럼_1_이름]: 문자열(text), not null
[컬럼_2_이름]: 문자열(text), not null

관계:

- 없음

### 테이블 2

테이블명: video_posts
설명: 동영상 리스트를 저장한다.

컬럼:
[id]: text, PK, not null
[컬럼_1_이름]: 문자열(text), not null

관계:

- 없음

## 5. 화면 설계

### 화면 1

화면 이름: **\_\_**
화면 목적: **\_\_**

구성 요소:

- **\_\_** 목록
- **\_\_** 입력창
- **\_\_** 버튼
- 로딩/빈 상태/오류 메시지 영역

액션:

- 사용자가 **\_\_**한다 -> API: GET /**\_\_**
- 사용자가 **\_\_**한다 -> API: POST /**\_\_**

## 화면 1

화면 이름: 리스트 목록
화면 목적: 자신이 작성한 게시글과 게시글 작성

구성 요소:

- 게시글 목록
- 새 게시글 버튼
- 로딩/빈 상태/오류 메시지 영역

액션:

- 사용자가 작성한 게시글을 클릭한다 -> API: GET /list_posts, video_posts
- 사용자가 새 게시글을 작성한다 -> API: 없음
- 사용자가 게시글을 삭제한다 -> API: DELETE /list_posts, video_posts/:id

### 화면 2

화면 이름: 게시글 작성 및 수정
화면 목적: 새 게시글을 작성 및 수정

구성 요소:

- 게시글 제목 영역
- 게시글 내용 영역
- 게시글 수정 버튼
- 게시글 저장 버튼

액션:

- 사용자가 게시글을 작성한다 -> API: GET /list_posts, video_posts
- 사용자가 게시글을 수정한다 -> API: PATCH /list_posts, video_posts/:id

## 6. API 명세

### API 1

- 기능 이름: 게시글 목록
- 다루는 객체: list_posts, video_posts
- Method: GET
- Path: /list_posts, video_posts
- 요청 데이터: 없음
- 응답 데이터: list_posts, video_posts 목록

### API 2

- 기능 이름: 게시글 삭제
- 다루는 객체: list_posts, video_posts
- Method: DELETE
- Path: /list_posts, video_posts /:id
- 요청 데이터: 없음
- 응답 데이터: 성공메세지

### API 3

- 기능 이름: 게시글 수정
- 다루는 객체: list_posts, video_posts
- Method: PATCH
- Path: /list_posts, video_posts /:id
- 요청 데이터: title, text, username
- 응답 데이터: 수정된 list_posts, video_posts

### API 4

- 기능 이름: 게시글 저장(생성)
- 다루는 객체: list_posts, video_posts
- Method: POST
- Path: /list_posts, video_posts
- 요청 데이터: title, text, username
- 응답 데이터: 새로운 list_posts, video_posts

## 7. 7주차 구현 우선순위

1. 게시글 작성 화면
2. 테이블 구성
3. 수정 및 삭제 버튼
