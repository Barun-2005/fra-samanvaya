const DssPanel = ({ recommendations, onApply }) => {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-background dark:bg-background-dark">
          <h4 className="font-bold">Recommendation Summary</h4>
          <p className="mt-2 text-sm">{recommendations.summary}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-lg bg-background dark:bg-background-dark">
                <h4 className="font-bold">Confidence Score</h4>
                <p className="mt-2 text-2xl font-bold text-primary dark:text-accent">{(recommendations.confidenceScore * 100).toFixed(0)}%</p>
            </div>
            <div className="p-4 rounded-lg bg-background dark:bg-background-dark">
                <h4 className="font-bold">Recommended Action</h4>
                <p className="mt-2 text-2xl font-bold text-success">{recommendations.recommendedAction}</p>
            </div>
        </div>
        <div className="flex justify-end">
            <button 
                onClick={onApply}
                className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
                Apply Recommendation
            </button>
        </div>
      </div>
    );
  };
  
  export default DssPanel;