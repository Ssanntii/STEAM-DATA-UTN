import { useEffect, useState } from "react";
import GameGrid from "../components/GameGrid";
import steamApi from "../api/steamApi";

export default function Deals() {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await steamApi.getFeatured();
        
        // Featured contiene specials (ofertas)
        const deals = response.specials?.items || [];
        setSpecials(deals);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Ofertas Especiales</h1>
      <GameGrid games={specials} loading={loading} />
    </div>
  );
}