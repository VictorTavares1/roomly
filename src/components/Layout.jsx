import Sidebar from "./Sidebar";
import AssistantChat from "./AssistantChat";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-4 md:p-6 xl:p-8 custom-scrollbar min-w-0 overflow-x-hidden">
                    {children}
                </main>
            </div>
            <AssistantChat />
        </div>
    );
}
