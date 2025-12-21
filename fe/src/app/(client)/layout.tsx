import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider của Client
import PublicNavbar from "@/components/PublicNavbar";
import AuthModal from "@/components/Auth/AuthModal";
import Footer from "@/components/Footer";
import ChatBubble from "@/components/ChatBot/ChatBubble";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        // **Bọc tất cả mọi thứ của Client bằng AuthProvider của Client**
        <AuthProvider>
            <PublicNavbar />
            <main style={{ paddingTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
                {children}
                <ChatBubble />
            </main>
            <Footer />
            <AuthModal />
        </AuthProvider>
    );
}