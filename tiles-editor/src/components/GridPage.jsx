import WFC from "./WFC";
import "./GridPage.css";

function GridPage({ tiles }) {
  return (
    <div className="grid-page">
      <h2>Large Grid WFC</h2>
      <WFC
        tiles={tiles}
        numRows={20}
        numCols={30}
        key={JSON.stringify(tiles)}
        showGridlines={false}
      />
    </div>
  );
}

export default GridPage;
