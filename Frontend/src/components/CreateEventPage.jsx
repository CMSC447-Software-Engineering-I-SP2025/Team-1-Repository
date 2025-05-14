import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from "./UserProvider";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const CreateEventPage = ({ }) => {  // Assuming userId is passed as a prop or from context

	const location = useLocation();
	const groupID = location.state?.groupID;
	console.log("GroupID is: ", groupID);

	const { user: authenticatedUser, loading } = useUser();
	const user = authenticatedUser || {};
	const navigate = useNavigate(); // Add navigate for redirection

	if (!groupID) {
		return <div className="text-center text-gray-500">No group selected</div>;
	}

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [time, setTime] = useState('');
	const [place, setPlace] = useState('');

	const createEvent = async (e) => {
		e.preventDefault();

		// Prepare the data for the review
		const eventData = {
            //UserId: user.id,
            EventId: 0, //this is stupid
			GroupId: groupID,
			EventName: name,
            EventDescription: description,
            EventDate: "string",
			EventTime: time,
			EventLocation: place
        };

        console.log("Posting event: ", eventData);

        try {
            const url = `https://localhost:7195/api/Database/climbGroupEvent`;
			const response = await axios.post(url, eventData);
			console.log('Event created successfully:', response.data);
			//navigate('/group', { state: { groupID: groupID }})
		} catch (error) {
			console.error('Error creating event:', error);
		}
	};

	return (
		<div className="login-container">
			<form className="login-form" onSubmit={createEvent}>
				<h2>Create Event</h2>
				<div className="form-group">
					<input
						type="text"
						placeholder="What is this event called?"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
				<div className="form-group">
					<input
						type="text"
						placeholder="What is this event about?"
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>
				<div className="form-group">
					<input
						type="datetime-local"
						id="time"
						value={time}
						onChange={(e) => setTime(e.target.value)}
					/>
				</div>
				<div className="form-group">
					<input
						type="text"
						placeholder="Where will this event take place?"
						id="place"
						value={place}
						onChange={(e) => setPlace(e.target.value)}
					/>
				</div>
				<button type="submit">Submit</button>
			</form>
		</div>
	);
};

export default CreateEventPage;
