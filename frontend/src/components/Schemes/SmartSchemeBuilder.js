import { useState } from 'react';
import { Plus, Trash, Wand2 } from 'lucide-react';

export default function SmartSchemeBuilder({ value, onChange }) {
    const [rules, setRules] = useState(value || []);

    const addRule = () => {
        const newRule = { criteria: 'landSize', operator: '>', value: '', logicalOp: 'AND' };
        const updatedRules = [...rules, newRule];
        setRules(updatedRules);
        onChange(updatedRules);
    };

    const removeRule = (index) => {
        const updatedRules = rules.filter((_, i) => i !== index);
        setRules(updatedRules);
        onChange(updatedRules);
    };

    const updateRule = (index, field, val) => {
        const updatedRules = [...rules];
        updatedRules[index][field] = val;
        setRules(updatedRules);
        onChange(updatedRules);
    };

    // AI Generator (Mock for now, will connect to Gemini later)
    const generateRules = () => {
        // In a real app, this would call an API with the scheme description
        const mockRules = [
            { criteria: 'landSize', operator: '<', value: '2', logicalOp: 'AND' },
            { criteria: 'income', operator: '<', value: '50000', logicalOp: 'AND' }
        ];
        setRules(mockRules);
        onChange(mockRules);
    };

    return (
        <div className="space-y-4 border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Eligibility Rules</h3>
                <button
                    type="button"
                    onClick={generateRules}
                    className="text-xs flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                >
                    <Wand2 className="w-3 h-3" />
                    Auto-Generate from Description
                </button>
            </div>

            {rules.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">
                    No rules defined. This scheme is open to everyone.
                </div>
            ) : (
                <div className="space-y-2">
                    {rules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && (
                                <span className="text-xs font-bold text-slate-400 w-8 text-center">{rule.logicalOp}</span>
                            )}
                            <select
                                className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                value={rule.criteria}
                                onChange={(e) => updateRule(index, 'criteria', e.target.value)}
                            >
                                <option value="landSize">Land Size (ha)</option>
                                <option value="income">Annual Income (₹)</option>
                                <option value="caste">Caste Category</option>
                                <option value="age">Age (Years)</option>
                                <option value="gender">Gender</option>
                            </select>
                            <select
                                className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                value={rule.operator}
                                onChange={(e) => updateRule(index, 'operator', e.target.value)}
                            >
                                <option value=">">Greater Than</option>
                                <option value="<">Less Than</option>
                                <option value="==">Equals</option>
                                <option value="!=">Not Equals</option>
                            </select>
                            <input
                                type="text"
                                className="p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm flex-1"
                                placeholder="Value"
                                value={rule.value}
                                onChange={(e) => updateRule(index, 'value', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeRule(index)}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={addRule}
                className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
                <Plus className="w-4 h-4" />
                Add Rule
            </button>
        </div>
    );
}
