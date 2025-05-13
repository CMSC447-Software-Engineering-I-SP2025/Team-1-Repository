import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserProvider";

const useFavoriteClimbs = (updateUserFavorites = () => {}) => {
  const { user: currentUser } = useUser();
  const [favoriteClimbs, setFavoriteClimbs] = useState([]);

  useEffect(() => {
    const fetchFavoriteClimbs = async () => {
      if (!currentUser?.id) {
        console.error("User is not logged in. Cannot fetch favorite climbs.");
        return;
      }

      try {
        const response = await axios.get("https://localhost:7195/api/Database/FavoriteClimb", {
          params: { userId: currentUser.id },
        });

        setFavoriteClimbs(simplifiedFavorites);
        updateUserFavorites(simplifiedFavorites);
      } catch (error) {
        console.error("Error fetching favorite climbs:", error);
      }
    };

    fetchFavoriteClimbs();
  }, [updateUserFavorites, currentUser]);

  const addFavoriteClimb = async (climb) => {
    if (!currentUser?.id) return;

    try {
      await axios.post("https://localhost:7195/api/Database/FavoriteClimb", {
        userId: currentUser.id,
        climbId: climb.id,
        parentAreaId: climb.parentAreaId,
      });

      const updated = [...favoriteClimbs, climb];
      setFavoriteClimbs(updated);
      updateUserFavorites(updated);
    } catch (error) {
      console.error("Error adding favorite climb:", error);
    }
  };

  const removeFavoriteClimb = async (climbId) => {
    if (!currentUser?.id) return;

    try {
      await axios.delete("https://localhost:7195/api/Database/FavoriteClimb", {
        data: {
          userId: currentUser.id,
          climbId,
        },
      });

      const updated = favoriteClimbs.filter((fav) => fav.id !== climbId);
      setFavoriteClimbs(updated);
      updateUserFavorites(updated);
    } catch (error) {
      console.error("Error removing favorite climb:", error);
    }
  };

  const toggleFavoriteClimb = async (climb) => {
    if (!currentUser?.id) return;

    const isFavorite = favoriteClimbs.some((fav) => fav.id === climb.id);

    if (isFavorite) {
      setFavoriteClimbs((prev) => prev.filter((fav) => fav.id !== climb.id));
      updateUserFavorites(favoriteClimbs.filter((fav) => fav.id !== climb.id));
      await removeFavoriteClimb(climb.id);
    } else {
      const newClimb = {
        id: climb.id,
        parentAreaId: climb.parentAreaId,
        name: climb.name,
      };
      setFavoriteClimbs((prev) => [...prev, newClimb]);
      updateUserFavorites([...favoriteClimbs, newClimb]);
      await addFavoriteClimb(newClimb);
    }
  };

  return { favoriteClimbs, toggleFavoriteClimb };
};

export default useFavoriteClimbs;
