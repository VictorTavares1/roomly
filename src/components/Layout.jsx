import Sidebar from "./Sidebar";
import AssistantChat from "./AssistantChat";

export default function Layout({ children }) {
    return (
        <div className="h-screen bg-gray-50 dark:bg-slate-900 flex flex-col lg:flex-row overflow-hidden transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                <main className="flex-1 p-4 md:p-6 xl:p-8 min-w-0 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
            <AssistantChat />
        </div>
    );
}
