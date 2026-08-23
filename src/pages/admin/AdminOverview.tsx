import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { calculateLossAversion, calculateRiskAversion, extractGeneration, extractRole } from '../../lib/mathEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Loader2 } from 'lucide-react';

const AdminOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [genData, setGenData] = useState<any[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: responses, error: respError } = await supabase.from('responses').select('*');
      const { data: answers, error: ansError } = await supabase.from('answers').select('*');

      if (respError) throw respError;
      if (ansError) throw ansError;

      // Process answers per response
      const answersByResponse: Record<string, any> = {};
      answers?.forEach(a => {
        if (!answersByResponse[a.response_id]) answersByResponse[a.response_id] = {};
        answersByResponse[a.response_id][a.question_id] = a.answer_value;
      });

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
        const gen = extractGeneration(rAnswers);
        const role = extractRole(rAnswers);
        
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#F4C542] mb-4" />
        <p className="text-gray-500 font-medium">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Average Risk Tolerance by Generation</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="generation" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="avgRiskTolerance" name="Risk Tolerance (Alpha)" fill="#F4C542" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Loss Aversion by Role</h2>
        <div className="h-[400px] w-full flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={roleData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="role" tick={{ fill: '#1E293B', fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748B' }} />
              <Radar name="Loss Aversion (Lambda)" dataKey="avgLossAversion" stroke="#1E293B" fill="#1E293B" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
