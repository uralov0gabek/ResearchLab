import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Download, Users, Brain, Loader2 } from 'lucide-react';
import { apiFetch } from '../../services/api/apiClient';
import { processUserCPT } from '../../utils/cptCalculations';
import type { Question } from '../../types';

interface GroupStats {
  count: number;
  alpha: number | null;
  beta: number | null;
  lambda: number | null;
}

const Results: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [qData, rData] = await Promise.all([
          apiFetch('/questions').catch(() => []),
          apiFetch('/responses').catch(() => [])
        ]);
        setQuestions(qData);
        setResponses(rData);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!questions.length || !responses.length) return null;

    let totalAlpha = 0, totalBeta = 0, totalLambda = 0;
    let aCount = 0, bCount = 0, lCount = 0;

    const cohorts: Record<string, GroupStats> = {
      'Founders': { count: 0, alpha: null, beta: null, lambda: null },
      'Investors (VC)': { count: 0, alpha: null, beta: null, lambda: null },
      'Employees/Workers': { count: 0, alpha: null, beta: null, lambda: null },
      'Students & Others': { count: 0, alpha: null, beta: null, lambda: null }
    };

    // Temporarily storing sums for cohorts
    const cohortSums: Record<string, { a: number, ac: number, b: number, bc: number, l: number, lc: number }> = {
      'Founders': { a: 0, ac: 0, b: 0, bc: 0, l: 0, lc: 0 },
      'Investors (VC)': { a: 0, ac: 0, b: 0, bc: 0, l: 0, lc: 0 },
      'Employees/Workers': { a: 0, ac: 0, b: 0, bc: 0, l: 0, lc: 0 },
      'Students & Others': { a: 0, ac: 0, b: 0, bc: 0, l: 0, lc: 0 }
    };

    responses.forEach(res => {
      const answers = res.answers || {};
      const cpt = processUserCPT(answers, questions);
      
      // Determine cohort based on "R1" question
      const r1Q = questions.find(q => q.text && q.text.startsWith('R1.'));
      let cohortKey = 'Students & Others';
      
      if (r1Q && answers[r1Q.id]) {
        const role = answers[r1Q.id] as string;
        if (role.includes('Entrepreneur')) cohortKey = 'Founders';
        else if (role.includes('investor')) cohortKey = 'Investors (VC)';
        else if (role.includes('employee')) cohortKey = 'Employees/Workers';
      }

      cohorts[cohortKey].count++;

      if (cpt.alpha) {
        totalAlpha += cpt.alpha; aCount++;
        cohortSums[cohortKey].a += cpt.alpha; cohortSums[cohortKey].ac++;
      }
      if (cpt.beta) {
        totalBeta += cpt.beta; bCount++;
        cohortSums[cohortKey].b += cpt.beta; cohortSums[cohortKey].bc++;
      }
      if (cpt.lambda) {
        totalLambda += cpt.lambda; lCount++;
        cohortSums[cohortKey].l += cpt.lambda; cohortSums[cohortKey].lc++;
      }
    });

    Object.keys(cohorts).forEach(k => {
      if (cohortSums[k].ac > 0) cohorts[k].alpha = cohortSums[k].a / cohortSums[k].ac;
      if (cohortSums[k].bc > 0) cohorts[k].beta = cohortSums[k].b / cohortSums[k].bc;
      if (cohortSums[k].lc > 0) cohorts[k].lambda = cohortSums[k].l / cohortSums[k].lc;
    });

    return {
      totalResponses: responses.length,
      avgAlpha: aCount > 0 ? totalAlpha / aCount : null,
      avgBeta: bCount > 0 ? totalBeta / bCount : null,
      avgLambda: lCount > 0 ? totalLambda / lCount : null,
      cohorts
    };

  }, [questions, responses]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!stats || stats.totalResponses === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Results & Analytics</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <LineChart className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">No results yet</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Once users complete the survey, CPT (Cumulative Prospect Theory) analytics and cohort comparisons will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatParam = (val: number | null) => val ? val.toFixed(3) : '-';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Results & CPT Analytics</h1>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          CSV yuklash
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium">Total Participants</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalResponses}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium">Global Alpha (α)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatParam(stats.avgAlpha)}</p>
          <p className="text-sm text-slate-400 mt-1">Value sensitivity (gains)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Brain className="w-5 h-5 text-pink-500" />
            <h3 className="font-medium">Global Beta (β)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatParam(stats.avgBeta)}</p>
          <p className="text-sm text-slate-400 mt-1">Value sensitivity (losses)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Brain className="w-5 h-5 text-rose-500" />
            <h3 className="font-medium">Global Lambda (λ)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatParam(stats.avgLambda)}</p>
          <p className="text-sm text-slate-400 mt-1">Loss aversion coefficient</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Cohort Comparisons (Founders vs Employees vs VCs)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
              <tr>
                <th className="py-4 px-6">Cohort</th>
                <th className="py-4 px-6 text-center">Count</th>
                <th className="py-4 px-6 text-center">Alpha (α)</th>
                <th className="py-4 px-6 text-center">Beta (β)</th>
                <th className="py-4 px-6 text-center">Lambda (λ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Object.entries(stats.cohorts).map(([name, data]) => (
                <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium">{name}</td>
                  <td className="py-4 px-6 text-center">{data.count}</td>
                  <td className="py-4 px-6 text-center font-mono">{formatParam(data.alpha)}</td>
                  <td className="py-4 px-6 text-center font-mono">{formatParam(data.beta)}</td>
                  <td className="py-4 px-6 text-center font-mono font-medium text-rose-600">{formatParam(data.lambda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Results;
