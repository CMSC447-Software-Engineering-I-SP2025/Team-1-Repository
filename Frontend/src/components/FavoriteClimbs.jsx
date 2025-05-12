import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserProvider"; // Use the custom hook from UserProvider

const useFavoriteClimbs = (updateUserFavorites = () => {}) => {
  const { user: currentUser } = useUser(); // Access currentUser using useUser hook
  const [favoriteClimbs, setFavoriteClimbs] = useState([]);

  useEffect(() => {
    const fetchFavoriteClimbs = async () => {
      if (!currentUser || !currentUser.id) {
        console.error("User is not logged in. Cannot fetch favorite climbs.");
        return;
      }

      try {
        // Fetch favorite climb IDs
        const response = await axios.get("https://localhost:7195/api/Database/FavoriteClimb", {
          params: { userId: currentUser.id },
        });
        const climbIds = response.data;

        // Fetch climb details using the IDs
        const climbDetailsPromises = climbIds.map((id) =>
          axios.get(`https://localhost:7195/api/Database/ClimbDetails/${id}`)
        );
        const climbDetailsResponses = await Promise.all(climbDetailsPromises);

        // Extract climb details
        const climbs = climbDetailsResponses.map((res) => res.data);
        setFavoriteClimbs(climbs);
        updateUserFavorites(climbs); // Update parent state
      } catch (error) {
        console.error("Error fetching favorite climbs:", error);
      }
    };

    fetchFavoriteClimbs();
  }, [updateUserFavorites, currentUser]); // Ensure it runs when updateUserFavorites or currentUser changes

  const addFavoriteClimb = async (climb) => {
    if (!currentUser || !currentUser.id) {
      console.error("User is not logged in. Cannot add favorite climb.");
      return;
    }

    try {
      console.log("Adding favorite climb with userId:", currentUser.id, "and climbId:", climb.id);
      await axios.post("https://localhost:7195/api/Database/FavoriteClimb", {
        userId: currentUser.id,
        climbId: climb.id,
      });
      const updatedFavorites = [...favoriteClimbs, climb];
      setFavoriteClimbs(updatedFavorites);
      updateUserFavorites(updatedFavorites); // Update parent state
    } catch (error) {
      console.error("Error adding favorite climb:", error);
    }
  };

  const removeFavoriteClimb = async (climbId) => {
    if (!currentUser || !currentUser.id) return;

    try {
      console.log("Removing favorite climb with userId:", currentUser.id, "and climbId:", climbId);
      await axios.delete("https://localhost:7195/api/Database/FavoriteClimb", {
        data: {
          userId: currentUser.id,
          climbId: climbId,
        },
      });

      setFavoriteClimbs((prev) =>
        prev.filter((fav) => fav.id !== climbId)
      );
      updateUserFavorites(
        favoriteClimbs.filter((fav) => fav.id !== climbId)
      );
    } catch (error) {
      console.error("Error removing favorite climb:", error);
    }
  };

  const toggleFavoriteClimb = async (climb) => {
    if (!currentUser || !currentUser.id) {
      console.error("User is not logged in. Cannot toggle favorite climb.");
      return;
    }

    const isAlreadyFavorite = favoriteClimbs.some((fav) => fav.id === climb.id);

    try {
      if (isAlreadyFavorite) {
        // Update state first to ensure UI reflects changes immediately
        setFavoriteClimbs((prev) => prev.filter((fav) => fav.id !== climb.id));
        updateUserFavorites(
          favoriteClimbs.filter((fav) => fav.id !== climb.id)
        );
        await removeFavoriteClimb(climb.id);
      } else {
        // Update state first to ensure UI reflects changes immediately
        setFavoriteClimbs((prev) => [...prev, climb]);
        updateUserFavorites([...favoriteClimbs, climb]);
        await addFavoriteClimb(climb);
      }

      // Debugging log to verify state update
      console.log("Updated favoriteClimbs state:", favoriteClimbs);
    } catch (error) {
      console.error("Error toggling favorite climb:", error);
    }
  };

  return { favoriteClimbs, toggleFavoriteClimb };
};

export default useFavoriteClimbs;