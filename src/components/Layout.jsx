import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar max-w-screen-2xl w-full mx-auto">
                {children}
            </main>
        </div>
    );
}
