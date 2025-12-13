import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Login() {


  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    console.log("A tentar entrar com:", email, password);

    try {
      const resposta = await fetch("http://localhost/roomly_api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      });

      const dados = await resposta.json();

      if (dados.status === "sucesso") {

        localStorage.setItem("user", JSON.stringify(dados.user));
        alert("BEM-VINDO " + dados.user.name + "! ");

        navigate('/dashboard');

      } else {
        alert("ERRO: " + dados.mensagem);
      }

    } catch (erro) {
      console.error("Erro no sistema:", erro);

      alert("Erro ao ligar ao servidor (ou erro no código React).");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-4xl h-[550px] overflow-hidden">


        <div className="hidden md:flex w-1/2 relative flex-col justify-end p-10 text-white">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" alt="School" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-blue-900/90 to-blue-800/40"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Roomly</h1>
            <p className="text-blue-100 text-lg">Gestão inteligente de espaços.</p>
          </div>
        </div>


        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center bg-white">
          <h2 className="text-3xl font-bold text-gray-800 tracking-wide mb-8">Bem-vindo</h2>

          <div className="w-full mb-4">
            <input
              type="text"
              placeholder="Email"
              className="input w-full bg-blue-50 pl-4 border-none text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="w-full mb-6">
            <input
              type="password"
              placeholder="Password"
              className="input w-full bg-blue-50 pl-4 border-none text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            className="btn w-full bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg shadow-lg text-lg h-12">
            ENTRAR
          </button>
        </div>
      </div>
    </div>
  )
}