/**
 * LUXURY SPACE - Core Application Logic
 * Optimized for diverse motion and premium aesthetic.
 */

let currentUser = null;

// [Auth Toggle] Smooth transition between sections
function toggleAuth(isLogin) {
    const loginSec = document.getElementById('login-section');
    const signupSec = document.getElementById('signup-section');
    
    if (isLogin) {
        signupSec.classList.add('hidden');
        loginSec.classList.remove('hidden');
        loginSec.style.animation = 'reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
        loginSec.classList.add('hidden');
        signupSec.classList.remove('hidden');
        signupSec.style.animation = 'reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    }
}

// [Registration]
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

// [Authentication]
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
        alert("아이디 또는 비밀번호가 틀립니다.");
    }
}

// [Interface State]
function showMainContent() {
    const authContainer = document.getElementById('auth-container');
    const mainContent = document.getElementById('main-content');
    
    authContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
    // Entrance animation for main content
    mainContent.style.animation = 'reveal-up 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    
    document.getElementById('user-info').innerText = `탐험가: ${currentUser.username}`;
    
    const githubBtn = document.getElementById('my-github-link');
    if (currentUser.github_url) {
        githubBtn.href = currentUser.github_url;
        githubBtn.style.display = 'inline-flex';
    } else {
        githubBtn.style.display = 'none';
    }

    fetchPosts();
}

function handleLogout() {
    currentUser = null;
    location.reload();
}

// [Data Persistence]
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

async function fetchPosts() {
    const res = await fetch(`/api/posts/${currentUser.id}`);
    const data = await res.json();

    renderList(data.lists, 'list-posts-container', 'list');
    renderList(data.videos, 'video-posts-container', 'video');
}

// [Rendering with diverse motion]
function renderList(items, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.length ? '' : '<p class="empty-msg" style="color: rgba(255,255,255,0.3); font-size: 0.9rem;">기록된 임무가 없습니다.</p>';

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'post-item';
        
        const delay = index * 0.08;
        div.style.animation = `reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s backwards`;
        
        const content = type === 'list' ? item.content : item.url;
        let linkHtml = '';
        
        if (type === 'video') {
            const isGithub = content.includes('github.com');
            const iconClass = isGithub ? 'fab fa-github' : 'fas fa-external-link-alt';
            const linkText = isGithub ? '저장소 열기' : '링크 열기';
            linkHtml = `<a href="${content}" target="_blank" class="video-link"><i class="${iconClass}"></i> ${linkText}</a>`;
        } else {
            linkHtml = `<p>${content}</p>`;
        }

        div.innerHTML = `
            <h3>${item.title}</h3>
            ${linkHtml}
            <div class="item-actions">
                <button class="btn btn-outline btn-sm" style="font-size: 0.8rem; padding: 8px 16px; border-radius: 12px; color: #ff3b30; border-color: rgba(255, 59, 48, 0.2);" onclick="deletePost('${type}', ${item.id})">삭제</button>
            </div>
        `;
        container.appendChild(div);
    });
}

async function deletePost(type, id) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/posts/${type}/${id}`, { method: 'DELETE' });
    fetchPosts();
}

// [Dynamic Interaction Observer]
const motionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
        }
    });
}, { threshold: 0.1 });

// Initialize cards with motion-ready state
document.querySelectorAll('.card').forEach(card => {
    if (!card.parentElement.id.includes('auth')) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.98)';
        card.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
        motionObserver.observe(card);
    }
});
