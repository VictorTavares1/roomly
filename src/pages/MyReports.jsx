import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyReports() {
    const navigate = useNavigate();
    useEffect(() => { navigate("/report-issue", { replace: true }); }, [navigate]);
    return null;
}
