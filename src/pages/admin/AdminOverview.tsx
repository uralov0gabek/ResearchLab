import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { calculateLossAversion, calculateRiskAversion, extractGeneration, extractRole } from '../../lib/mathEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Loader2, Users, ClipboardList, CheckCircle } from 'lucide-react';

interface ChartDataGen {
  generation: string;
  avgRiskTolerance: number;
}

interface ChartDataRole {
  role: string;
  avgLossAversion: number;
}

const AdminOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [genData, setGenData] = useState<ChartDataGen[]>([]);
  const [roleData, setRoleData] = useState<ChartDataRole[]>([]);
  
  // Stat card states
  const [totalResponses, setTotalResponses] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState(0);
  const [completionRate, setCompletionRate] = useState(100);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: responses, error: respError } = await supabase.from('responses').select('*');
      const { data: answers, error: ansError } = await supabase.from('answers').select('*');
      const { data: modules, error: qError } = await supabase.from('survey_modules').select('id, questions(id)').eq('status', 'active');

      if (respError) throw respError;
      if (ansError) throw ansError;
      if (qError) throw qError;
      
      const numActiveQuestions = modules?.reduce((acc: number, m: any) => acc + (m.questions?.length || 0), 0) || 0;

      setTotalResponses(responses?.length || 0);
      setActiveQuestions(numActiveQuestions);
      
      // Process answers per response
      const answersByResponse: Record<string, any> = {};
      answers?.forEach(a => {
        if (!answersByResponse[a.response_id]) answersByResponse[a.response_id] = {};
        answersByResponse[a.response_id][a.question_id] = a.value;
      });

      // Calculate true completion rate
      let completeCount = 0;
      responses?.forEach(r => {
        const rAnswers = answersByResponse[r.id] || {};
        if (numActiveQuestions > 0 && Object.keys(rAnswers).length >= numActiveQuestions) {
          completeCount++;
        }
      });
      const calcRate = responses?.length && numActiveQuestions > 0 
        ? Math.round((completeCount / responses.length) * 100) 
        : (responses?.length ? 100 : 0);
      setCompletionRate(calcRate);

      // Aggregate data
      const genAgg: Record<string, { totalRisk: number, count: number }> = {
        'Boomers': { totalRisk: 0, count: 0 },
        'Gen X': { totalRisk: 0, count: 0 },
        'Millennials': { totalRisk: 0, count: 0 },
        'Gen Z': { totalRisk: 0, count: 0 }
      };

      const roleAgg: Record<string, { totalLossAversion: number, count: number }> = {
        'Founder': { totalLossAversion: 0, count: 0 },
        'VC': { totalLossAversion: 0, count: 0 },
        'Worker': { totalLossAversion: 0, count: 0 }
      };

      responses?.forEach(r => {
        const rAnswers = answersByResponse[r.id] || {};
        const gen = extractGeneration(rAnswers) || 'Millennials';
        const role = extractRole(rAnswers) || 'Worker';
        
        const risk = calculateRiskAversion(rAnswers);
        const lossAversion = calculateLossAversion(rAnswers);

        if (genAgg[gen]) {
          genAgg[gen].totalRisk += risk;
          genAgg[gen].count += 1;
        }

        if (roleAgg[role]) {
          roleAgg[role].totalLossAversion += lossAversion;
          roleAgg[role].count += 1;
        }
      });

      const processedGenData = Object.keys(genAgg).map(gen => ({
        generation: gen,
        avgRiskTolerance: genAgg[gen].count > 0 ? Number((genAgg[gen].totalRisk / genAgg[gen].count).toFixed(2)) : 0
      }));

      const processedRoleData = Object.keys(roleAgg).map(role => ({
        role: role,
        avgLossAversion: roleAgg[role].count > 0 ? Number((roleAgg[role].totalLossAversion / roleAgg[role].count).toFixed(2)) : 0
      }));

      setGenData(processedGenData);
      setRoleData(processedRoleData);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#F4C542] mb-4" />
        <p className="text-slate-500 font-medium">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow min-w-0">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex flex-shrink-0 items-center justify-center text-blue-600">
            <Users className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500 break-words">Total Responses</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 break-words">{totalResponses}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow min-w-0">
          <div className="w-14 h-14 rounded-full bg-yellow-50 flex flex-shrink-0 items-center justify-center text-[#F4C542]">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500 break-words">Active Questions</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 break-words">{activeQuestions}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow min-w-0">
          <div className="w-14 h-14 rounded-full bg-green-50 flex flex-shrink-0 items-center justify-center text-green-600">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500 break-words">Completion Rate</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 break-words">{completionRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {totalResponses === 0 ? (
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[300px]">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-xl font-semibold text-slate-700">No Data Yet</h3>
             <p className="text-slate-500 mt-2">Charts will appear here once you receive some survey responses.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                Average Risk Tolerance by Generation
              </h2>
              <div className="w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={genData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="generation" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="avgRiskTolerance" name="Risk Tolerance (Alpha)" fill="#F4C542" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                Loss Aversion by Role
              </h2>
              <div className="w-full flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={roleData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="role" tick={{ fill: '#0F172A', fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748B' }} />
                    <Radar name="Loss Aversion (Lambda)" dataKey="avgLossAversion" stroke="#0F172A" strokeWidth={2} fill="#0F172A" fillOpacity={0.7} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
