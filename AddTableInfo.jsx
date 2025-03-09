import React, { useState } from 'react';
import axios from 'axios';

const AddInfoToTables = () =>{
  const [user, setUser] = useState({ UserId: '', Name: '', Email: '', Password: '', AccountType: '' });
  const [route, setRoute] = useState({RouteId: '', Name: '', Grade: '', Longitude: '', Latitude: '', Picture: null });
  const [review, setReview] = useState({ UserId: '', RouteId: '', Rating: '', Text: '' });
  const [recommendation, setRecommendation] = useState({ RouteId: 0 });

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e, setState) => {
    const { name, files } = e.target;
    setState(prevState => ({ ...prevState, [name]: files[0] }));
  };

  const handleSubmit = async (e, endpoint, data) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      await axios.post(`http://localhost:5000/${endpoint}`, data, config);
      alert(`${endpoint} created successfully`);
    } catch (error) {
      alert(`Error creating ${endpoint}: ${error.response?.data || error.message}`);
    }
  };

  return (
    <div>
      <h1>Data Entry Test Form</h1>
      <form onSubmit={(e) => handleSubmit(e, 'user', user)}>
        <h2>Create User</h2>
        <input type="text" name="UserId" placeholder="User ID" value={user.UserId} onChange={(e) => handleInputChange(e, setUser)} required />
        <input type="text" name="Name" placeholder="Name" value={user.Name} onChange={(e) => handleInputChange(e, setUser)} required />
        <input type="email" name="Email" placeholder="Email" value={user.Email} onChange={(e) => handleInputChange(e, setUser)} required />
        <input type="password" name="Password" placeholder="Password" value={user.Password} onChange={(e) => handleInputChange(e, setUser)} required />
        <input type="text" name="AccountType" placeholder="Account Type" value={user.AccountType} onChange={(e) => handleInputChange(e, setUser)} required />
        <button type="submit">Create User</button>
      </form>

      <form onSubmit={(e) => handleSubmit(e, 'route', route)}>
        <h2>Create Route</h2>
        <input type="text" name="RouteId" placeholder="Route ID" value={route.RouteId} onChange={(e) => handleInputChange(e, setRoute)} required />
        <input type="text" name="Name" placeholder="Name" value={route.Name} onChange={(e) => handleInputChange(e, setRoute)} required />
        <input type="text" name="Grade" placeholder="Grade" value={route.Grade} onChange={(e) => handleInputChange(e, setRoute)} required />
        <input type="text" name="Longitude" placeholder="Longitude" value={route.Longitude} onChange={(e) => handleInputChange(e, setRoute)} required />
        <input type="text" name="Latitude" placeholder="Latitude" value={route.Latitude} onChange={(e) => handleInputChange(e, setRoute)} required />
        <input type="file" name="picture" onChange={(e) => handleFileChange(e, setRoute)} />
        <button type="submit">Create Route</button>
      </form>

      <form onSubmit={(e) => handleSubmit(e, 'review', review)}>
        <h2>Create Review</h2>
        <input type="text" name="UserId" placeholder="User ID" value={review.UserId} onChange={(e) => handleInputChange(e, setReview)} required />
        <input type="text" name="RouteId" placeholder="Route ID" value={review.RouteId} onChange={(e) => handleInputChange(e, setReview)} required />
        <input type="text" name="Rating" placeholder="Rating" value={review.Rating} onChange={(e) => handleInputChange(e, setReview)} required />
        <input type="text" name="Text" placeholder="Review Text" value={review.Text} onChange={(e) => handleInputChange(e, setReview)} required />
        <button type="submit">Create Review</button>
      </form>

      <form onSubmit={(e) => handleSubmit(e, 'recommendation', recommendation)}>
        <h2>Create Recommendation</h2>
        <input type="text" name="RouteId" placeholder="Route ID" value={recommendation.RouteId} onChange={(e) => handleInputChange(e, setRecommendation)} required />
        <button type="submit">Create Recommendation</button>
      </form>
    </div>
  );
}

export default AddInfoToTables;
