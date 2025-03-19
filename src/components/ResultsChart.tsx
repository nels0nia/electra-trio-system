
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Candidate {
  id: string;
  name: string;
  party: string;
  votes: number;
  color: string;
}

interface ResultsChartProps {
  title: string;
  description?: string;
  candidates: Candidate[];
  totalVotes: number;
  chartType?: 'bar' | 'pie';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border border-border shadow-sm">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p className="text-sm text-muted-foreground">{payload[0].payload.party}</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-muted-foreground">Votes:</span>
          <span className="font-medium">{payload[0].value}</span>
        </div>
      </div>
    );
  }

  return null;
};

const ResultsChart = ({ 
  title, 
  description, 
  candidates, 
  totalVotes,
  chartType = 'bar' 
}: ResultsChartProps) => {
  
  // Sort candidates by votes in descending order
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
  
  // Format percentage with 1 decimal place
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  return (
    <Card className="glass-card overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        
        <div className="w-full h-[300px]">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedCandidates}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  hide 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="votes" 
                  radius={[4, 4, 0, 0]}
                >
                  {sortedCandidates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedCandidates}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  dataKey="votes"
                  nameKey="name"
                >
                  {sortedCandidates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-6 border-t border-border pt-4">
          <ul className="space-y-3">
            {sortedCandidates.map((candidate) => (
              <li key={candidate.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: candidate.color }}
                  />
                  <span>{candidate.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({candidate.party})
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">{candidate.votes}</span>
                  <span className="text-xs ml-1 text-muted-foreground">
                    ({formatPercentage(candidate.votes / totalVotes)})
                  </span>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Votes:</span>
            <span className="font-medium">{totalVotes}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsChart;
