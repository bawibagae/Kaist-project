/**
 * app.js
 * 
 * 이 파일은 브라우저에서 실행되며, 백엔드 서버(Express)와 통신하여
 * 데이터를 주고받고 화면을 업데이트하는 역할을 합니다.
 */

// API 서버의 기본 주소 (현재 같은 서버이므로 생략 가능하지만 명시적 교육을 위해 작성)
const API_BASE_URL = '';

// DOM 요소 (HTML 엘리먼트) 가져오기
const postForm = document.getElementById('post-form');
const postTypeSelect = document.getElementById('post-type');
const titleInput = document.getElementById('title');
const usernameInput = document.getElementById('username');
const textInput = document.getElementById('text');
const listPostsContainer = document.getElementById('list-posts-container');
const videoPostsContainer = document.getElementById('video-posts-container');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const editIdInput = document.getElementById('edit-id');
const editTypeInput = document.getElementById('edit-type');

/**
 * [페이지 로드 시 실행]
 * 처음 페이지가 열릴 때 목록을 서버에서 불러옵니다.
 */
window.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});

/**
 * 모든 게시글(일반 리스트 & 영상 리스트)을 서버에서 가져오는 함수
 */
async function fetchPosts() {
    try {
        // [GET 요청] 각각의 엔드포인트에서 데이터를 가져옵니다.
        const [listRes, videoRes] = await Promise.all([
            fetch(`${API_BASE_URL}/list_posts`),
            fetch(`${API_BASE_URL}/video_posts`)
        ]);

        const listData = await listRes.json();
        const videoData = await videoRes.json();

        // 화면에 그리기
        renderPosts(listData.data, 'list');
        renderPosts(videoData.data, 'video');
    } catch (error) {
        console.error('데이터 불러오기 실패:', error);
        alert('데이터를 불러오는데 실패했습니다.');
    }
}

/**
 * 가져온 데이터를 HTML로 변환하여 화면에 보여주는 함수
 */
function renderPosts(posts, type) {
    const container = type === 'list' ? listPostsContainer : videoPostsContainer;
    
    // 기존 내용을 지우고 새로 그립니다.
    container.innerHTML = '';

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p class="empty-msg">등록된 게시글이 없습니다.</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        
        // 데이터 구조에 따른 내용 설정
        const contentText = type === 'list' ? post.content : post.url;
        const videoHtml = type === 'video' ? `<a href="${contentText}" target="_blank" class="video-link">📺 영상 보기</a>` : `<p>${contentText}</p>`;

        postElement.innerHTML = `
            <h3>${post.title}</h3>
            ${videoHtml}
            <p class="author">👤 작성자: ${post.username}</p>
            <div class="item-actions">
                <button class="btn btn-sm btn-edit" onclick="editPost(${post.id}, '${type}', '${post.title}', '${post.username}', '${contentText}')">수정</button>
                <button class="btn btn-sm btn-delete" onclick="deletePost(${post.id}, '${type}')">삭제</button>
            </div>
        `;
        container.appendChild(postElement);
    });
}

/**
 * [POST & PATCH] 게시글 저장 및 수정 처리
 */
postForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    const id = editIdInput.value;
    const isEdit = id !== '';
    const type = isEdit ? editTypeInput.value : postTypeSelect.value;
    
    // 서버로 보낼 데이터 객체 생성
    const postData = {
        title: titleInput.value,
        username: usernameInput.value,
        text: textInput.value
    };

    try {
        let response;
        if (isEdit) {
            // [PATCH 요청] 기존 데이터 수정
            response = await fetch(`${API_BASE_URL}/${type}_posts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        } else {
            // [POST 요청] 새로운 데이터 생성
            response = await fetch(`${API_BASE_URL}/${type}_posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        }

        const result = await response.json();
        if (result.success) {
            alert(isEdit ? '수정되었습니다!' : '저장되었습니다!');
            resetForm();
            fetchPosts(); // 목록 새로고침
        } else {
            alert('저장에 실패했습니다: ' + result.message);
        }
    } catch (error) {
        console.error('저장 중 오류 발생:', error);
    }
});

/**
 * [DELETE] 게시글 삭제 처리
 */
async function deletePost(id, type) {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
        // [DELETE 요청] 특정 ID의 데이터를 삭제합니다.
        const response = await fetch(`${API_BASE_URL}/${type}_posts/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.success) {
            fetchPosts(); // 목록 새로고침
        } else {
            alert('삭제 실패: ' + result.message);
        }
    } catch (error) {
        console.error('삭제 중 오류 발생:', error);
    }
}

/**
 * 수정 모드로 전환하는 함수 (폼에 기존 데이터 채우기)
 */
function editPost(id, type, title, username, text) {
    formTitle.innerText = '✏️ 게시글 수정';
    saveBtn.innerText = '수정 완료';
    cancelBtn.style.display = 'inline-block';
    
    // 폼 입력란에 기존 값 채우기
    editIdInput.value = id;
    editTypeInput.value = type;
    postTypeSelect.value = type;
    postTypeSelect.disabled = true; // 수정 시 타입 변경 방지
    
    titleInput.value = title;
    usernameInput.value = username;
    textInput.value = text;

    // 화면 상단으로 스크롤 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 폼 초기화 함수
 */
function resetForm() {
    formTitle.innerText = '📝 게시글 작성';
    saveBtn.innerText = '저장하기';
    cancelBtn.style.display = 'none';
    
    editIdInput.value = '';
    editTypeInput.value = '';
    postTypeSelect.disabled = false;
    
    postForm.reset();
}

// 취소 버튼 클릭 시 폼 초기화
cancelBtn.addEventListener('click', resetForm);
