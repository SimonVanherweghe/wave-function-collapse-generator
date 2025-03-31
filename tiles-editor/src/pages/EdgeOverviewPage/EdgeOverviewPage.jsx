import EdgeOverview from "../../components/EdgeOverview";
import "./EdgeOverviewPage.css";

function EdgeOverviewPage({ tiles }) {
  return (
    <div className="edge-overview-page">
      <EdgeOverview tiles={tiles} />
    </div>
  );
}

export default EdgeOverviewPage;
