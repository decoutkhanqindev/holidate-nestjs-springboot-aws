"use client";
import { useState } from "react";
import styles from "./ChatBubble.module.css";

export default function ChatBubble() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: "ai", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false); // thêm trạng thái đang nhập

    const handleSend = () => {
        if (!input.trim()) return;
        const userMessage = input;
        setMessages([...messages, { from: "user", text: userMessage }]);
        setInput("");
        setIsTyping(true); // bật hiệu ứng gõ của AI

        setTimeout(() => {
            setIsTyping(false);
            setMessages((msgs) => [
                ...msgs,
                { from: "ai", text: "Bạn hỏi: " + userMessage }
            ]);
        }, 1500);
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
                        Chat AI
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
                                <span>{msg.text}</span>
                            </div>
                        ))}

                        {isTyping && (
                            <div className={`${styles.chatMessage} ${styles.ai}`}>
                                <span className={styles.typing}>
                                    <span></span><span></span><span></span>
                                </span>
                            </div>
                        )}
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
                                placeholder="Nhập tin nhắn..."
                                className={styles.chatInput}
                            />
                            <button type="submit" className={styles.chatSendBtn}>
                                Gửi
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
