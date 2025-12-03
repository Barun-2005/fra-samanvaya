import { useState } from 'react';
import { Sliders, Zap, ArrowRight } from 'lucide-react';

export default function PolicySimulator() {
    const [budgetIncrease, setBudgetIncrease] = useState(0);
    const [landThreshold, setLandThreshold] = useState(2.0);
    const [simulating, setSimulating] = useState(false);
    const [result, setResult] = useState(null);

    const runSimulation = () => {
        setSimulating(true);
        // Mock simulation logic
        setTimeout(() => {
            const baseBeneficiaries = 1200;
            const budgetFactor = 1 + (budgetIncrease / 100);
            const landFactor = landThreshold < 2.0 ? 1.5 : 1.0;

            const newBeneficiaries = Math.floor(baseBeneficiaries * budgetFactor * landFactor);

            setResult({
                beneficiaries: newBeneficiaries,
                increase: newBeneficiaries - baseBeneficiaries,
                cost: (newBeneficiaries * 15000) / 10000000 // In Crores
            });
            setSimulating(false);
        }, 1500);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-amber-500" />
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Policy Simulator</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Simulate policy changes to predict impact before implementation.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <span>Budget Increase</span>
                            <span className="text-primary font-bold">+{budgetIncrease}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={budgetIncrease}
                            onChange={(e) => setBudgetIncrease(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <span>Land Eligibility Threshold</span>
                            <span className="text-primary font-bold">{landThreshold} ha</span>
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="5.0"
                            step="0.1"
                            value={landThreshold}
                            onChange={(e) => setLandThreshold(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>0.5 ha</span>
                            <span>Strict</span>
                            <span>5.0 ha</span>
                        </div>
                    </div>

                    <button
                        onClick={runSimulation}
                        disabled={simulating}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        {simulating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                                Simulating...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                Run Simulation
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                    {!result ? (
                        <div className="text-center text-slate-400">
                            <Sliders className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Adjust parameters and run simulation to see AI predictions.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Predicted Beneficiaries</div>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                                        {result.beneficiaries.toLocaleString()}
                                    </span>
                                    <span className="text-green-600 font-bold mb-1 flex items-center">
                                        <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                                        +{result.increase.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-700" />

                            <div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Estimated Cost Impact</div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    ₹{result.cost.toFixed(2)} Cr
                                </div>
                            </div>

                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg">
                                <strong>AI Insight:</strong> Lowering the land threshold to {landThreshold}ha significantly increases coverage in tribal belts.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
