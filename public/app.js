/**
 * Luxury Space To-Do App Logic
 */

let currentUser = null;

// [화면 전환] 로그인 <-> 회원가입
function toggleAuth(isLogin) {
    document.getElementById('login-section').classList.toggle('hidden', !isLogin);
    document.getElementById('signup-section').classList.toggle('hidden', isLogin);
}

// [회원가입 처리]
async function handleSignup() {
    const username = document.getElementById('signup-id').value;
    const password = document.getElementById('signup-pw').value;
    const github_url = document.getElementById('signup-github').value;

    if (!username || !password) return alert("필수 정보를 입력하세요.");

    const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, github_url })
    });
    const data = await res.json();

    if (data.success) {
        alert("가입 성공. 로그인해주세요.");
        toggleAuth(true);
    } else {
        alert(data.message);
    }
}

// [로그인 처리]
async function handleLogin() {
    const username = document.getElementById('login-id').value;
    const password = document.getElementById('login-pw').value;

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
        currentUser = data.user;
        showMainContent();
    } else {
        alert(data.message);
    }
}

// [메인 화면 표시]
function showMainContent() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('user-info').innerText = `탐험가: ${currentUser.username}`;
    
    const githubBtn = document.getElementById('my-github-link');
    if (currentUser.github_url) {
        githubBtn.href = currentUser.github_url;
    } else {
        githubBtn.classList.add('hidden');
    }

    fetchPosts();
}

// [로그아웃]
function handleLogout() {
    currentUser = null;
    location.reload();
}

// [기록 저장]
async function savePost() {
    const type = document.getElementById('post-type').value;
    const title = document.getElementById('title').value;
    const text = document.getElementById('text').value;

    if (!title || !text) return alert("내용을 입력하세요.");

    const endpoint = (type === 'list') ? '/api/list_posts' : '/api/video_posts';
    const body = { userId: currentUser.id, title };
    if (type === 'list') body.content = text; else body.url = text;

    await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    document.getElementById('title').value = '';
    document.getElementById('text').value = '';
    fetchPosts();
}

// [목록 불러오기]
async function fetchPosts() {
    const res = await fetch(`/api/posts/${currentUser.id}`);
    const data = await res.json();

    renderList(data.lists, 'list-posts-container', 'list');
    renderList(data.videos, 'video-posts-container', 'video');
}

function renderList(items, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.length ? '' : '<p class="empty-msg">기록된 임무가 없습니다.</p>';

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'post-item';
        div.style.animationDelay = `${index * 0.1}s`;
        
        const content = type === 'list' ? item.content : item.url;
        let linkHtml = '';
        
        if (type === 'video') {
            const isGithub = content.includes('github.com');
            const icon = isGithub ? '<i class="fab fa-github"></i>' : '<i class="fas fa-play-circle"></i>';
            const text = isGithub ? '저장소 열기' : '영상 열기';
            linkHtml = `<a href="${content}" target="_blank" class="video-link">${icon} ${text}</a>`;
        } else {
            linkHtml = `<p>${content}</p>`;
        }

        div.innerHTML = `
            <h3>${item.title}</h3>
            ${linkHtml}
            <div class="item-actions">
                <button class="btn btn-outline btn-sm" style="color: #ff5252; border-color: #ff5252;" onclick="deletePost('${type}', ${item.id})">삭제</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// [삭제 처리]
async function deletePost(type, id) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/posts/${type}/${id}`, { method: 'DELETE' });
    fetchPosts();
}

// Motion Effects (Scroll Reveal)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    observer.observe(card);
});
