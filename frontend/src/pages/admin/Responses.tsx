import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api/apiClient';
import { Loader2, Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { getLocalizedText } from '../../utils/localization';

interface ProcessedResponse {
  id: string;
  user_id: string | null;
  date: string;
  alpha: string;
  beta: string;
  lambda: string;
  answers?: Record<string, any>;
}

const Responses: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [responsesData, setResponsesData] = useState<ProcessedResponse[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, qData] = await Promise.all([
        apiFetch('/responses'),
        apiFetch('/questions').catch(() => [])
      ]);
      setResponsesData(data.responses || []);
      setQuestions(qData || []);
    } catch (err) {
      console.error('Error fetching responses data:', err);
      setResponsesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = () => {
    if (responsesData.length === 0) return;
    const headers = ['ID', 'User ID', 'Date', 'Alpha', 'Beta', 'Lambda'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + responsesData.map(r => `${r.id},${r.user_id || 'Anonymous'},${r.date},${r.alpha},${r.beta},${r.lambda}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "survey_responses.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredResponses = responsesData.filter((row) => 
    row.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500 max-w-full">
      <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Raw Responses</h2>
          <p className="text-sm text-slate-500 mt-1">View and analyze individual survey submissions.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search by ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
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
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Session ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">α</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">β</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">λ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResponses.map((row) => (
                <React.Fragment key={row.id}>
                  <tr 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => toggleRow(row.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {expandedRows.has(row.id) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        <span className="text-sm font-mono text-slate-500 max-w-[120px] truncate" title={row.id}>{row.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">
                      {row.user_id || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.alpha}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.beta}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.lambda}</td>
                  </tr>
                  {expandedRows.has(row.id) && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={6} className="px-6 py-6 border-b border-slate-100">
                        <div className="max-w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-hidden">
                          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            Detailed Answers for Response
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(row.answers || {}).length === 0 ? (
                              <p className="text-sm text-slate-500">No detailed answers available.</p>
                            ) : (
                              Object.entries(row.answers || {}).map(([qId, ans]) => {
                                if (qId === 'session_id') return null;
                                const q = questions.find(q => q.id === qId);
                                const questionTitle = q ? getLocalizedText(q.question_text || q.title || q.block_name, 'en') : qId;
                                return (
                                  <div key={qId} className="text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <div className="text-slate-500 mb-1 font-medium break-words whitespace-normal">{questionTitle}</div>
                                    <div className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg inline-block max-w-full break-words whitespace-pre-wrap">
                                      {typeof ans === 'object' ? JSON.stringify(ans) : String(ans)}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Responses;
