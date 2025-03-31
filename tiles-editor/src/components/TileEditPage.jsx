import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tile from "./Tile";
import "./TileEditPage.css";

function TileEditPage({ tiles, handleTileUpdate }) {
  const { tileId } = useParams();
  const navigate = useNavigate();
  const [tile, setTile] = useState(null);
  
  useEffect(() => {
    const id = parseInt(tileId, 10);
    if (isNaN(id) || id < 0 || id >= tiles.length) {
      // Invalid tile ID, redirect to home
      navigate("/");
      return;
    }
    
    setTile(tiles[id]);
  }, [tileId, tiles, navigate]);
  
  const handleUpdate = (updatedTile) => {
    const id = parseInt(tileId, 10);
    handleTileUpdate(id, updatedTile);
  };
  
  const handleBack = () => {
    navigate("/");
  };
  
  if (!tile) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="tile-edit-page">
      <h2>Edit Tile {tileId}</h2>
      
      <div className="tile-edit-container">
        <Tile 
          tile={tile} 
          tileId={parseInt(tileId, 10)} 
          onUpdate={handleUpdate} 
        />
      </div>
      
      <div className="tile-edit-actions">
        <button onClick={handleBack} className="back-button">
          Back to Tiles
        </button>
      </div>
    </div>
  );
}

export default TileEditPage;
