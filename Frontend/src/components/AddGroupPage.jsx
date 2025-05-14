import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const AddGroupPage = () => {  // Assuming userId is passed as a prop or from context

    const [group, setGroup] = useState('');
    const location = useLocation();
    const userID = location.state?.userID;

    const joinGroup = async (e) => {
        e.preventDefault();

        // Prepare the data for the review
        /*
        const requestData = {
            Receiver: receiver,
            Sender: userID //change this to userID
        };*/

        try {
            const url = `https://localhost:7195/api/Database/joinGroup?userId=${encodeURIComponent(userID)}&groupName=${encodeURIComponent(group)}`;
            const response = await axios.post(url);
            console.log('joined group successfully:', response.data);
        } catch (error) {
            console.error('Error joining group:', error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={joinGroup}>
                <h2>Join Group</h2>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="MD Group"
                        id="group"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default AddGroupPage;
