import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const AddFriendPage = ({ userId }) => {  // Assuming userId is passed as a prop or from context

    const [receiver, setReceiver] = useState('');
    const location = useLocation();
    const userID = location.state?.userID;

    const sendFriendRequest = async (e) => {
        e.preventDefault();

        // Prepare the data for the review
        /*
        const requestData = {
            Receiver: receiver,
            Sender: userID //change this to userID
        };*/

        try {
            const url = `https://localhost:7195/api/Database/sendFriendRequest?receiverUserName=${encodeURIComponent(receiver)}&senderUserId=${encodeURIComponent(userID)}`;
            const response = await axios.post(url);
            console.log('Friend request created successfully:', response.data);
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={sendFriendRequest}>
                <h2>Send friend request from: {userID} to:</h2>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="John Doe"
                        id="receiver"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default AddFriendPage;
