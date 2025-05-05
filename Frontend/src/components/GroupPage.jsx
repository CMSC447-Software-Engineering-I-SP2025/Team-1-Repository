import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";

const GroupPage = ({ }) => {
    const location = useLocation();
    const groupID = location.state?.groupID;
    console.log("GroupID is: ", groupID);
    const [group, setGroup] = useState({
        groupName: "MD Group",
        groupDescription: "A climb group for Maryland climbers"
    });

    const [error, setError] = useState("");

    const [post1] = useState({
        poster: "John Doe",
        text: "anyone else up in da clerb??"
    });
    const [post2] = useState({
        poster: "Walter White",
        text: "We need to cook Jesse!"
    });

    const [posts, setPosts] = useState([post1, post2]);

    useEffect(() => {
        if (!groupID) return;

        const fetchPosts = async (climbID) => {
            try {
                /*
                console.log("Climb ID being requested:", selectedClimb.id);
                const response = await axios.get(
                    "https://localhost:7195/api/Database/ReviewsByClimbID",
                    {
                        params: { id: selectedClimb.id }, //change this
                    }
                );
                console.log("API Response:", response.data);
                setReviews(response.data);
                */
            } catch (err) {
                console.error("Failed to fetch posts:", err);
                setError("Could not load posts.");
            }
        };

        fetchPosts(groupID);
    }, [groupID]);

    useEffect(() => {
        if (!groupID) return;

        const fetchGroup = async (climbID) => {
            try {
                /*
                console.log("Climb ID being requested:", selectedClimb.id);
                const response = await axios.get(
                    "https://localhost:7195/api/Database/ReviewsByClimbID",
                    {
                        params: { id: selectedClimb.id }, //change this
                    }
                );
                console.log("API Response:", response.data);
                setReviews(response.data);
                */
            } catch (err) {
                console.error("Failed to fetch group:", err);
                setError("Could not load group.");
            }
        };

        fetchGroup(groupID);
    }, [groupID]);

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>{group.groupName}</h2>
            <Link to="/create-event" state={{ groupID: groupID }} className="px-3">
                <div>Click me to create an event for this group!</div>
            </Link>
            <h2>{group.groupDescription}</h2>
            {posts.length === 0 ? (
                <p>No posts in this group.</p>
            ) : (
                <ul>
                    {posts.map((post, index) => (
                        <li key={index} style={{ marginBottom: "1rem" }}>
                            <strong>Username:</strong> {post.poster} <br />
                            <strong>Text:</strong> {post.text}<br />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GroupPage;