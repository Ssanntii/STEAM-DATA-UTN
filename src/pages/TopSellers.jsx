import { useEffect, useState } from "react";
import GameGrid from "../components/GameGrid";
import steamApi from "../api/steamApi";

export default function TopSellers() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        const response = await steamApi.getFeatured();
        
        // Featured contiene top_sellers
        const topSellers = response.top_sellers?.items || [];
        setGames(topSellers);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellers();
  }, []);

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Top Sellers</h1>
      <GameGrid games={games} loading={loading} />
    </div>
  );
}