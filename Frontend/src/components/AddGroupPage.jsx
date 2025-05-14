import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const AddGroupPage = () => {  // Assuming userId is passed as a prop or from context

    const [group, setGroup] = useState('');
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState("");
    const [groupRequirements, setGroupRequirements] = useState("open");
    const [groupPrice, setGroupPrice] = useState(0);
    const [groupType, setGroupType] = useState("public");
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

    const createGroup = async (e) => {
        e.preventDefault();

        // Prepare the data for group
        
        const groupData = {
            GroupName: groupName,
            GroupDescription: groupDescription,
            JoinRequirements: groupRequirements,
            Price: groupPrice,
            GroupType: groupType,
            GroupOwner: userID
        };

        try {
            const url = `https://localhost:7195/api/Database/climbGroup`;
            const response = await axios.post(url, groupData);
            console.log('created group successfully:', response.data);
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    return (
        <div>
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
            <div>  -------          </div>
        <div className="login-container">
            <form className="login-form" onSubmit={createGroup}>
                <h2>Create Group</h2>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="MD Group"
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    </div>
                    <div className="form-group">
                        <textarea
                            type="text"
                            placeholder="A group for climbers in Maryland"
                            id="groupDescription"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <select
                            id="groupRequirements"
                            value={groupRequirements}
                            onChange={(e) => setGroupRequirements(e.target.value)}
                        >
                            <option value="open">Open</option>
                            <option value="invite_only">Invite Only</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    {groupRequirements == "paid" ? (
                        
                        <div className="form-group">
                                <input
                                    type="number"
                                    placeholder="0"
                                    id="groupPrice"
                                    value={groupPrice}
                                    onChange={(e) => setGroupPrice(e.target.value)}
                                />
                            </div>
                    ): (
                            <p></p>
                    )}
                    <div className="form-group">
                        <select
                            id="groupType"
                            value={groupType}
                            onChange={(e) => setGroupType(e.target.value)}
                        >
                            <option value="open">public</option>
                            <option value="invite_only">private</option>
                        </select>
                    </div>
                <button type="submit">Submit</button>
            </form>
            </div>
        </div>
    );
};

export default AddGroupPage;
