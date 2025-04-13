import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewReviewsPage = ({ selectedClimb }) => {
    let climbID = selectedClimb.id;

    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!selectedClimb) return;

        const fetchReviews = async (climbID) => {
            try {
                //climbID = "string"; //remove this
                console.log("Climb ID being requested:", "string");
                const response = await axios.get(
                    "https://localhost:7195/api/Database/ReviewsByClimbID",
                    {
                        params: { id: "string" }, //change this
                    }
                );
                console.log("API Response:", response.data);
                setReviews(response.data);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
                setError("Could not load reviews.");
            }
        };

        fetchReviews(climbID);
    }, [climbID]);

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Reviews for Climb: {selectedClimb.name}</h2>
            {reviews.length === 0 ? (
                <p>No reviews for this climb.</p>
            ) : (
                <ul>
                    {reviews.map((review, index) => (
                        <li key={index} style={{ marginBottom: "1rem" }}>
                            <strong>User ID:</strong> {review.UserId} <br />
                            <strong>Rating:</strong> {review.Rating / 2} / 5<br />
                            <strong>Review:</strong> {review.Text}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewReviewsPage;