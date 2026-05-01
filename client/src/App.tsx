import "./index.css";
import ProfilePage from "./ProfilePage";

export function App() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/google";
  };

  if (window.location.pathname === "/profile") {
    return <ProfilePage />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <h1 className="text-5xl font-bold my-4 leading-tight">Oauth Connect</h1>
      <div>
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login with Google 😁
        </button>
      </div>
    </div>
  );
}

export default App;
