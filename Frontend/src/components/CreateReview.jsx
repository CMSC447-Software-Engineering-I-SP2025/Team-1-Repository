import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from "./UserProvider";

const CreateReviewPage = ({ selectedClimb, userId }) => {  // Assuming userId is passed as a prop or from context

    const { user: authenticatedUser, loading } = useUser();
    const user = authenticatedUser || {};

    if (!selectedClimb) {
        return <div className="text-center text-gray-500">No climb selected</div>;
    }

    const [rating, setRating] = useState('');  // Rating will be a string to match your model
    const [description, setDescription] = useState('');

    const createReview = async (e) => {
        e.preventDefault();

        // Prepare the data for the review
        const reviewData = {
            UserId: user.id,
            RouteId: selectedClimb.id,
            Rating: parseInt(rating), 
            Text: description,
        };

        try {
            const response = await axios.post('https://localhost:7195/api/Database/review', reviewData);
            console.log('Review created successfully:', response.data);
        } catch (error) {
            console.error('Error creating review:', error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={createReview}>
                <h2>Create Review for {selectedClimb.name}</h2>
                <div className="form-group">
                    <input
                        type="range"
                        max="10"
                        min="1"
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="What are your thoughts?"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default CreateReviewPage;
