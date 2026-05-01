import "./index.css";
import ProfilePage from "./ProfilePage";

export function App() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:5000/github";
  };

  // simple routing
  if (window.location.pathname === "/profile") {
    return <ProfilePage />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 text-center">
      <h1 className="text-5xl font-bold my-4">OAuth Connect</h1>

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Login with Google
      </button>

      <button
        onClick={handleGithubLogin}
        className="bg-gray-700 text-white px-4 py-2 rounded ml-4"
      >
        Login with GitHub
      </button>
    </div>
  );
}

export default App;