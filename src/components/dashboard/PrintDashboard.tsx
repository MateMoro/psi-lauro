import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from 'recharts';

interface DashboardData {
  totalPatients: number;
  avgStayDays: string;
  readmissionRate: string;
  topDiagnoses: Array<{name: string; value: number; percentage: number}>;
  genderDistribution: Array<{name: string; value: number}>;
  ageDistribution: Array<{name: string; value: number; count: number}>;
  capsDistribution: Array<{name: string; value: number}>;
  procedenciaDistribution: Array<{name: string; value: number; count: number}>;
  raceDistribution: Array<{name: string; value: number}>;
  advancedMetrics?: {
    occupancyRate: string;
    readmission7Days: string;
    readmission15Days: string;
    readmission30Days: string;
    weekendDischargeRate: string;
    interconsultationsVolume: number;
    responseTime60min: number;
    responseTime120min: number;
    currentOccupancy: number;
    totalCapacity: number;
  };
}

interface PrintDashboardProps {
  data: DashboardData;
  onReady?: () => void;
}

export function PrintDashboard({ data, onReady }: PrintDashboardProps) {
  // Call onReady when component is mounted and ready
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onReady) {
        onReady();
      }
    }, 1000); // Increased delay for Recharts to render
    
    return () => clearTimeout(timer);
  }, [onReady]);

  // Prepare data for existing chart components
  const genderChartData = data.genderDistribution.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]
  }));

  const ageChartData = data.ageDistribution.map(item => ({
    name: item.name,
    value: item.value,
    count: item.count
  }));

  const diagnosisChartData = data.topDiagnoses.slice(0, 6).map(item => ({
    name: item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name,
    value: item.percentage
  }));

  const weekdayData = [
    { name: 'Segunda', value: 18, percentage: 18 },
    { name: 'Terça', value: 16, percentage: 16 },
    { name: 'Quarta', value: 15, percentage: 15 },
    { name: 'Quinta', value: 17, percentage: 17 },
    { name: 'Sexta', value: 14, percentage: 14 },
    { name: 'Sábado', value: 10, percentage: 10 },
    { name: 'Domingo', value: 10, percentage: 10 }
  ];

  const raceChartData = data.raceDistribution.slice(0, 6).map((item, index) => ({
    name: item.name,
    value: item.value,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]
  }));

  return (
    <div
      id="print-dashboard"
      className="w-[1200px] h-[850px] bg-white p-6 print:p-0"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '0',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-t-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">PSI ANALYTICS</h1>
            <p className="text-lg opacity-90">Panorama Assistencial e Estratégico</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Hospital Municipal Prof. Dr. Waldomiro de Paula</p>
            <p className="opacity-90">Serviço de Psiquiatria</p>
            <p className="text-sm opacity-80">{new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{data.totalPatients}</div>
            <div className="text-sm text-gray-600">Total Pacientes</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{data.avgStayDays} dias</div>
            <div className="text-sm text-gray-600">LOS Médio</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{data.readmissionRate}%</div>
            <div className="text-sm text-gray-600">Taxa Readmissão</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {data.advancedMetrics?.occupancyRate || 'N/A'}%
            </div>
            <div className="text-sm text-gray-600">Taxa Ocupação</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribuição por Gênero</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {genderChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={genderChartData[index].color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Faixa Etária</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Main Pathologies */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Principais Patologias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={diagnosisChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={60} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                <Bar dataKey="value" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekday Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Análise Semanal - Altas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentual de Altas']} />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Occupancy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Taxa de Ocupação Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={[
                { month: 'Jan', rate: 85 },
                { month: 'Fev', rate: 78 },
                { month: 'Mar', rate: 92 },
                { month: 'Abr', rate: 88 },
                { month: 'Mai', rate: 90 },
                { month: 'Jun', rate: 87 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis domain={[70, 100]} fontSize={12} />
                <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Ocupação']} />
                <Line type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Race Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribuição Racial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 pt-2">
              {raceChartData.map((item, index) => {
                const percentage = Math.round((item.value / data.totalPatients) * 100);
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Readmission & Procedencia */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Readmission Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Métricas de Readmissão & LOS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{data.readmissionRate}%</div>
                <div className="text-xs text-gray-600">Readmissão Geral</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">{data.advancedMetrics?.readmission7Days || 'N/A'}%</div>
                <div className="text-xs text-gray-600">Readmissão 7 dias</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{data.advancedMetrics?.readmission30Days || 'N/A'}%</div>
                <div className="text-xs text-gray-600">Readmissão 30 dias</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{data.avgStayDays} dias</div>
                <div className="text-xs text-gray-600">LOS Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Procedencias */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Principais Procedências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.procedenciaDistribution.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium truncate max-w-[180px]">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">{item.value}%</span>
                    <span className="text-lg">{index % 3 === 0 ? '↗️' : index % 3 === 1 ? '↔️' : '↘️'}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}