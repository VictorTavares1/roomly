import Sidebar from "./Sidebar";

export default function Layout({ children, title }) {
    // children = o conteúdo específico de cada página (tabelas, formulários, etc.)

    return (
        <div className="flex min-h-screen bg-[#f3f4f6]">
            {/* A Sidebar está sempre aqui */}
            <Sidebar />

            {/* Área Principal de Conteúdo */}
            <main className="flex-1 p-8 ml-72 transition-all duration-300 ease-in-out">
                <div className="max-w-6xl mx-auto animate-fade-in">

                    {/* Se passarmos um título, mostra-o logo (Opcional) */}
                    {title && (
                        <h1 className="text-3xl font-bold text-slate-800 mb-6">{title}</h1>
                    )}

                    {/* Aqui entra o conteúdo da página */}
                    {children}
                </div>
            </main>
        </div>
    );
}