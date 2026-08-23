import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { calculateLossAversion, calculateRiskAversion, extractGeneration, extractRole } from '../../lib/mathEngine';
import { Loader2 } from 'lucide-react';

const Responses: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [responsesData, setResponsesData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: responses, error: respError } = await supabase.from('responses').select('*').order('submitted_at', { ascending: false });
      const { data: answers, error: ansError } = await supabase.from('answers').select('*');

      if (respError) throw respError;
      if (ansError) throw ansError;

      const answersByResponse: Record<string, any> = {};
      answers?.forEach(a => {
        if (!answersByResponse[a.response_id]) answersByResponse[a.response_id] = {};
        answersByResponse[a.response_id][a.question_id] = a.answer_value;
      });

      const processed = responses?.map(r => {
        const rAnswers = answersByResponse[r.id] || {};
        const gen = extractGeneration(rAnswers);
        const role = extractRole(rAnswers);
        const risk = calculateRiskAversion(rAnswers);
        const loss = calculateLossAversion(rAnswers);

        return {
          id: r.id,
          date: new Date(r.submitted_at).toLocaleDateString(),
          generation: gen,
          role: role,
          riskTolerance: risk.toFixed(2),
          lossAversion: loss.toFixed(2)
        };
      }) || [];

      setResponsesData(processed);
    } catch (err) {
      console.error('Error fetching responses data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-slate-900">Raw Responses</h2>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#F4C542] mb-4" />
          <p className="text-gray-500 font-medium">Loading responses...</p>
        </div>
      ) : responsesData.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500">No responses recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Session ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Generation</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Risk (α)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Loss Av. (λ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {responsesData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500" title={row.id}>{row.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {row.generation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {row.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{row.riskTolerance}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{row.lossAversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Responses;
