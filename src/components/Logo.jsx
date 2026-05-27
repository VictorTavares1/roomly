import logoImg from "../assets/ChatGPT Image May 7, 2026, 03_20_41 PM.png";

export default function Logo({ className = "w-10 h-10" }) {
    return (
        <img src={logoImg} alt="Roomly" className={className} />
    );
}