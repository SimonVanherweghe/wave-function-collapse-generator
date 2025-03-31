import TileVariants from "../../components/TileVariants";
import "./TileVariantsPage.css";

function TileVariantsPage({ tiles }) {
  return (
    <div className="tile-variants-page">
      <TileVariants tiles={tiles} />
    </div>
  );
}

export default TileVariantsPage;
