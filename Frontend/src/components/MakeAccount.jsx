import React, { useState } from "react";

const MakeAccount = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, we'll log the username and password
        console.log("Username:", username);
        console.log("Password:", password);
        // You can handle further logic like sending the data to a server
    };

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-3xl font-bold mb-6">Create an Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-lg">
                        Username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-lg">
                        Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md">
                    Create Account
                </button>
            </form>
        </div>
    );
};

export default MakeAccount;
