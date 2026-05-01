import { useEffect, useState } from "react";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔥 fetch with refresh token logic
    const fetchWithAuth = async (url) => {
        let res = await fetch(url, {
        credentials: "include",
        });

        // 🔁 if access expired → refresh
        if (res.status === 401) {
        await fetch("http://localhost:5000/refresh", {
            credentials: "include",
        });

        // retry original request
        res = await fetch(url, {
            credentials: "include",
        });
        }

        return res;
    };

    useEffect(() => {
        const fetchUser = async () => {
        try {
            const res = await fetchWithAuth("http://localhost:5000/me");

            if (!res.ok) {
            throw new Error("Not authenticated");
            }

            const data = await res.json();
            setUser(data.user);
        } catch (err) {
            console.error(err);

            // ✅ safe redirect (NO LOOP)
            if (window.location.pathname !== "/") {
            window.location.replace("/");
            }
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

        window.location.replace("/");
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

        <img
            src={user?.photo || "https://placehold.co/100x100"}
            alt="profile"
            onError={(e) => {
            e.target.src = "https://placehold.co/100x100";
            }}
            className="w-24 h-24 rounded-full mx-auto mb-4"
        />

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