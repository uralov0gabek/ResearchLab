import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { calculateLossAversion, calculateRiskAversion, extractGeneration, extractRole } from '../../lib/mathEngine';
import { Loader2, Search, Eye } from 'lucide-react';

interface ProcessedResponse {
  id: string;
  session_id: string;
  date: string;
  generation: string;
  role: string;
  riskTolerance: string;
  lossAversion: string;
}

const Responses: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [responsesData, setResponsesData] = useState<ProcessedResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: responses, error: respError } = await supabase.from('responses').select('*').order('started_at', { ascending: false });
      const { data: answers, error: ansError } = await supabase.from('answers').select('*');

      if (respError) throw respError;
      if (ansError) throw ansError;

      const answersByResponse: Record<string, any> = {};
      answers?.forEach(a => {
        if (!answersByResponse[a.response_id]) answersByResponse[a.response_id] = {};
        answersByResponse[a.response_id][a.question_id] = a.value;
      });

      const processed: ProcessedResponse[] = responses?.map(r => {
        const rAnswers = answersByResponse[r.id] || {};
        const gen = extractGeneration(rAnswers) || 'Unknown';
        const role = extractRole(rAnswers) || 'Unknown';
        const risk = calculateRiskAversion(rAnswers);
        const loss = calculateLossAversion(rAnswers);

        return {
          id: r.id,
          session_id: r.session_id || r.id,
          date: new Date(r.started_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
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

  const filteredResponses = responsesData.filter((row) => 
    row.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.generation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Raw Responses</h2>
          <p className="text-sm text-slate-500 mt-1">View and analyze individual survey submissions.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F4C542] focus:border-transparent transition-all"
            placeholder="Search by ID or Role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#F4C542] mb-4" />
          <p className="text-slate-500 font-medium">Loading responses...</p>
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium text-lg">No responses found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Session ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Generation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk (α)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loss Av. (λ)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResponses.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500" title={row.session_id}>
                    {row.session_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{row.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {row.generation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                      {row.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.riskTolerance}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.lossAversion}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1.5" title="View Details">
                      <Eye className="w-4 h-4" />
                      <span className="sr-only md:not-sr-only md:text-xs md:font-medium">View</span>
                    </button>
                  </td>
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
