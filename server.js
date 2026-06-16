const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors()); // 다른 도메인에서의 요청을 허용 (CORS)
app.use(express.json()); // JSON 형식의 요청 본문을 읽을 수 있게 함
app.use(express.static('public')); // 'public' 폴더의 정적 파일(HTML, CSS, JS)을 제공

// SQLite 데이터베이스 연결 및 초기화
// database.sqlite 파일을 생성하고 연결합니다.
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err.message);
    } else {
        console.log('SQLite 데이터베이스 연결 성공');
        initializeDatabase();
    }
});

// 테이블 생성 함수
function initializeDatabase() {
    // list_posts 테이블: 일반 텍스트 할 일 저장
    // id: 고유 식별자, title: 제목, content: 내용, username: 작성자
    db.run(`CREATE TABLE IF NOT EXISTS list_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        username TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // video_posts 테이블: 코딩 영상 링크 저장
    // id: 고유 식별자, title: 제목, url: 영상 링크, username: 작성자
    db.run(`CREATE TABLE IF NOT EXISTS video_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        username TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

/**
 * [API 1] 게시글 목록 조회 (GET)
 * 모든 텍스트 리스트와 영상 리스트를 각각 반환합니다.
 */
app.get('/list_posts', (req, res) => {
    db.all('SELECT * FROM list_posts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

app.get('/video_posts', (req, res) => {
    db.all('SELECT * FROM video_posts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

/**
 * [API 4] 게시글 저장/생성 (POST)
 */
app.post('/list_posts', (req, res) => {
    const { title, text, username } = req.body; // 요청 데이터에서 추출
    const content = text; // 설계 문서의 'text'를 content로 저장
    db.run('INSERT INTO list_posts (title, content, username) VALUES (?, ?, ?)', [title, content, username], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: { id: this.lastID, title, content, username } });
    });
});

app.post('/video_posts', (req, res) => {
    const { title, text, username } = req.body;
    const url = text; // 영상 링크를 text 필드로 받아서 url로 저장
    db.run('INSERT INTO video_posts (title, url, username) VALUES (?, ?, ?)', [title, url, username], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, data: { id: this.lastID, title, url, username } });
    });
});

/**
 * [API 3] 게시글 수정 (PATCH)
 */
app.patch('/list_posts/:id', (req, res) => {
    const { title, text, username } = req.body;
    const { id } = req.params;
    db.run('UPDATE list_posts SET title = ?, content = ?, username = ? WHERE id = ?', [title, text, username, id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: '수정 완료' });
    });
});

app.patch('/video_posts/:id', (req, res) => {
    const { title, text, username } = req.body;
    const { id } = req.params;
    db.run('UPDATE video_posts SET title = ?, url = ?, username = ? WHERE id = ?', [title, text, username, id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: '수정 완료' });
    });
});

/**
 * [API 2] 게시글 삭제 (DELETE)
 */
app.delete('/list_posts/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM list_posts WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: '삭제 성공' });
    });
});

app.delete('/video_posts/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM video_posts WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: '삭제 성공' });
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
