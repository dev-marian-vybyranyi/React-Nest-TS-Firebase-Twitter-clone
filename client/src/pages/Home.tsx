import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Home</h1>
      <div className="App">
        {user ? (
          <div>
            <div>Привіт, {user.email}!</div>
            <button onClick={() => navigate("/profile")}>Go to Profile</button>
          </div>
        ) : (
          <button onClick={() => navigate("/sign-in")}>Sign in</button>
        )}
      </div>
    </div>
  );
};

export default Home;
