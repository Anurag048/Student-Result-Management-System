import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const navigate = useNavigate();
  const { username, role, logout } = useAuth()
  const handleLogout = async ()=>{
    logout();
    navigate('/');
  }
  return (
    <div>
      <nav>
        <span>Hi {username}!</span>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  )
}
