import React, { useState } from 'react';
import axios from 'axios';

const AddFriendPage = ({ userId }) => {  // Assuming userId is passed as a prop or from context

    const [receiver, setReceiver] = useState('');

    const sendFriendRequest = async (e) => {
        e.preventDefault();

        // Prepare the data for the review
        const requestData = {
            Receiver: receiver,
            Sender: 1 //change this to userID
        };

        try {
            //const response = await axios.post('https://localhost:7195/api/Database/review', reviewData);
            //console.log('Friend request created successfully:', response.data);
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={sendFriendRequest}>
                <h2>Send friend request</h2>
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
