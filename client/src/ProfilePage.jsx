import { useEffect, useState } from "react";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔥 fetch logged-in user
    useEffect(() => {
        const fetchUser = async () => {
        try {
            const res = await fetch("http://localhost:5000/me", {
            credentials: "include", // 🔥 IMPORTANT
            });

            if (!res.ok) {
            throw new Error("Not authenticated");
            }

            const data = await res.json();
            setUser(data.user);
        } catch (err) {
            console.error(err);
            window.location.href = "/"; // redirect if not logged in
        } finally {
            setLoading(false);
        }
        };

        fetchUser();
    }, []);

    // 🔥 logout
    const handleLogout = async () => {
        await fetch("http://localhost:5000/logout", {
        method: "GET",
        credentials: "include",
        });

        window.location.href = "/";
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">
            Welcome, {user?.username || "User"} 👋
        </h2>

        <p className="mb-4">Email: {user?.email}</p>

        {user?.photo && (
            <img
            src={user.photo}
            alt="profile"
            className="w-24 h-24 rounded-full mx-auto mb-4"
            />
        )}

        <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
        >
            Logout
        </button>
        </div>
    );
};

export default ProfilePage;