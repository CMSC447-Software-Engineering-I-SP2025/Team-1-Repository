import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";

const GroupPage = ({ }) => {
    const location = useLocation();
    const group = location.state?.group;
    console.log("GroupID is: ", group.GroupId);
    /*const [group, setGroup] = useState({
        groupName: "MD Group",
        groupDescription: "A climb group for Maryland climbers"
    });*/

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
        if (!group) return;

        const fetchEvents = async (groupID) => {
            try {
                
                console.log("Group ID being requested:", group.GroupId);
                //const url = `https://localhost:7195/api/Database/joinGroup?userId=${encodeURIComponent(userID)}&groupName=${encodeURIComponent(group)}`;
                const url = `https://localhost:7195/api/Database/group/${encodeURIComponent(group.GroupId)}/events`;
                const response = await axios.get(
                    url
                );
                console.log("API Response:", response.data);
                setPosts(response.data);
                
            } catch (err) {
                console.error("Failed to fetch events:", err);
                setError("Could not load events.");
            }
        };

        fetchEvents(group.GroupId);
    }, [group.GroupId]);

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>{group.groupName}</h2>
            <Link to="/create-event" state={{ groupID: group.GroupId }} className="px-3">
                <div>Click me to create an event for this group!</div>
            </Link>
            <h2>{group.groupDescription}</h2>
            {posts.length === 0 ? (
                <p>No posts in this group.</p>
            ) : (
                <ul>
                    {posts.map((post, index) => (
                        <li key={index} style={{ marginBottom: "1rem" }}>
                            <strong>EventName:</strong> {post.EventName} <br />
                            <strong>Description:</strong> {post.EventDescription}<br />
                            <strong>Time:</strong> {post.EventTime}<br />
                            <strong>Location:</strong> {post.EventLocation}<br />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GroupPage;