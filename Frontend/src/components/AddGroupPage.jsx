import React, { useState } from 'react';
import axios from 'axios';

const AddGroupPage = ({ userId }) => {  // Assuming userId is passed as a prop or from context

    const [group, setGroup] = useState('');

    const sendFriendRequest = async (e) => {
        e.preventDefault();

        // Prepare the data for the review
        const groupData = {
            Group: group,
            Sender: 1 //change this to userID
        };

        try {
            //const response = await axios.post('https://localhost:7195/api/Database/review', reviewData);
            //console.log('Group relation created successfully:', response.data);
        } catch (error) {
            console.error('Error creating group relation:', error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={sendFriendRequest}>
                <h2>Join group</h2>
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
