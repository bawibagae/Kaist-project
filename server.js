const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('DB 연결 실패:', err.message);
    else {
        console.log('SQLite 연결 성공');
        initializeDatabase();
    }
});

// 테이블 구조 확장 (사용자 정보 및 깃허브 링크 추가)
function initializeDatabase() {
    // 1. 사용자 테이블 (회원가입/로그인용)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        github_url TEXT
    )`);

    // 2. 일반 과제 테이블 (user_id와 연결)
    db.run(`CREATE TABLE IF NOT EXISTS list_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // 3. 영상 포스트 테이블 (user_id와 연결)
    db.run(`CREATE TABLE IF NOT EXISTS video_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
}

/** ---------------- API 영역 ---------------- **/

// [회원가입]
app.post('/api/signup', (req, res) => {
    const { username, password, github_url } = req.body;
    db.run('INSERT INTO users (username, password, github_url) VALUES (?, ?, ?)', 
        [username, password, github_url], function(err) {
        if (err) return res.status(400).json({ success: false, message: "이미 존재하는 아이디입니다." });
        res.json({ success: true, message: "회원가입 성공" });
    });
});

// [로그인]
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (err || !user) return res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 틀립니다." });
        res.json({ success: true, user: { id: user.id, username: user.username, github_url: user.github_url } });
    });
});

// [포스트 목록 조회] (특정 사용자의 데이터만)
app.get('/api/posts/:userId', (req, res) => {
    const userId = req.params.userId;
    db.all('SELECT * FROM list_posts WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, lists) => {
        db.all('SELECT * FROM video_posts WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, videos) => {
            res.json({ success: true, lists, videos });
        });
    });
});

// [과제 추가]
app.post('/api/list_posts', (req, res) => {
    const { userId, title, content } = req.body;
    db.run('INSERT INTO list_posts (user_id, title, content) VALUES (?, ?, ?)', [userId, title, content], function(err) {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, id: this.lastID });
    });
});

// [영상 추가]
app.post('/api/video_posts', (req, res) => {
    const { userId, title, url } = req.body;
    db.run('INSERT INTO video_posts (user_id, title, url) VALUES (?, ?, ?)', [userId, title, url], function(err) {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, id: this.lastID });
    });
});

// [삭제]
app.delete('/api/posts/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const table = type === 'list' ? 'list_posts' : 'video_posts';
    db.run(`DELETE FROM ${table} WHERE id = ?`, [id], function(err) {
        res.json({ success: true });
    });
});

app.listen(PORT, () => console.log(`럭셔리 스페이스 서버: http://localhost:${PORT}`));
