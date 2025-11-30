"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./ChatBubble.module.css";

// Webhook URL từ backend
const N8N_WEBHOOK_URL = 'http://18.138.100.51:5678/webhook/9c4bdf4a-4fbc-485b-b3bc-e09647d8d450';
// Hàm lấy Session ID (dùng để định danh người chat)
function getSessionId(): string {
    if (typeof window === 'undefined') return 'user_' + Math.random().toString(36).substring(2, 11);

    let sessionId = localStorage.getItem('holidate_session_id');
    if (!sessionId) {
        sessionId = 'user_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('holidate_session_id', sessionId);
    }
    return sessionId;
}

// Hàm chuyển đổi Markdown cơ bản sang HTML để hiển thị ảnh, link, chữ đậm
function parseMarkdown(text: string): string {
    if (!text) return "";

    return text
        // 1. Xử lý Ảnh: ![alt](url)
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')

        // 2. Xử lý Link: [text](url)
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

        // 3. Xử lý Tiêu đề: ### text
        .replace(/###\s?(.*?)(?:\n|$)/g, '<h3>$1</h3>')

        // 4. Xử lý In đậm: **text**
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')

        // 5. Xử lý Xuống dòng
        .replace(/\n/g, '<br>');
}

interface Message {
    from: "user" | "ai";
    text: string;
    html?: boolean; // Nếu true, text chứa HTML đã được parse
}

export default function ChatBubble() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            from: "ai",
            text: "Xin chào! 👋 Mình là Trợ lý ảo của Hệ thống Đặt phòng Khách sạn Holidate.<br>Mình có thể giúp gì cho bạn về tìm phòng và giá cả hôm nay?",
            html: true
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages((msgs) => [...msgs, { from: "user", text: userMessage }]);
        setInput("");
        setIsTyping(true);

        const currentSessionId = getSessionId();

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: currentSessionId
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Xử lý Markdown sang HTML trước khi hiển thị
            const botReplyHtml = parseMarkdown(data.output || data.message || "Xin lỗi, tôi không thể trả lời câu hỏi này.");

            setMessages((msgs) => [
                ...msgs,
                { from: "ai", text: botReplyHtml, html: true }
            ]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((msgs) => [
                ...msgs,
                { from: "ai", text: "⚠️ Lỗi kết nối, vui lòng thử lại sau!", html: false }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {!open && (
                <button
                    className={styles.chatButton}
                    onClick={() => setOpen(true)}
                    aria-label="Mở chat AI"
                >
                    💬
                </button>
            )}

            {open && (
                <div className={styles.chatBox}>
                    <div className={styles.chatHeader}>
                        <div>
                            <h3>🏝️ Holidate Assistant</h3>
                            <p>Trợ lý ảo AI hỗ trợ đặt phòng 24/7</p>
                        </div>
                        <button
                            className={styles.chatClose}
                            onClick={() => setOpen(false)}
                            aria-label="Đóng chat"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${styles.chatMessage} ${styles[msg.from]}`}
                            >
                                {msg.html ? (
                                    <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                                ) : (
                                    <span>{msg.text}</span>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className={`${styles.chatMessage} ${styles.ai}`}>
                                <span className={styles.typing}>
                                    <span></span><span></span><span></span>
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.chatInputArea}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className={styles.chatForm}
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Nhập câu hỏi của bạn..."
                                className={styles.chatInput}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                className={styles.chatSendBtn}
                                disabled={isTyping || !input.trim()}
                            >
                                Gửi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
