import React, { useState, useEffect } from "react";
import type { EarningsStats, Transaction } from "./types";
import client from "../../lib/client";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function HostEarnings(): React.ReactElement {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingPayout: 0,
    averagePerBooking: 0,
    totalBookings: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all earnings data in parallel using RPC client
      const [statsRes, transactionsRes, payoutRes] = await Promise.all([
        client.api.earnings.stats.$get(),
        client.api.earnings.transactions.$get(),
        client.api.earnings.payout.$get(),
      ]);

      if (statsRes.status === 401 || transactionsRes.status === 401 || payoutRes.status === 401) {
        setError("Please log in to view your earnings.");
        setLoading(false);
        return;
      }

      if (!statsRes.ok || !transactionsRes.ok || !payoutRes.ok) {
        const errorData = await statsRes.json().catch(() => ({ message: "Failed to fetch earnings data" }));
        throw new Error("message" in errorData ? errorData.message : "Failed to fetch earnings data");
      }


      const statsData = await statsRes.json();
      const transactionsData = await transactionsRes.json();

      setStats(statsData);
      setTransactions((transactionsData.transactions || []) as Transaction[]);

    } catch (err) {
      console.error("Error fetching earnings:", err);
      setError("Failed to load earnings data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const earningsStats = [
    {
      label: "Total Earnings",
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: "💰",
      color: "bg-green-500",
    },
    {
      label: "This Month",
      value: `₹${stats.monthlyEarnings.toLocaleString()}`,
      icon: "📅",
      color: "bg-blue-500",
    },
    {
      label: "Pending Money To Receive",
      value: `₹${stats.pendingPayout.toLocaleString()}`,
      icon: "⏳",
      color: "bg-yellow-500",
    },
    {
      label: "Avg. per Booking",
      value: `₹${stats.averagePerBooking.toLocaleString()}`,
      icon: "📊",
      color: "bg-purple-500",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      refunded: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  // Prepare chart data based on selected period
  const prepareEarningsTrendData = () => {
    const now = new Date();
    const dataMap = new Map<string, number>();

    // Initialize empty data points based on period
    if (selectedPeriod === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('en-US', { weekday: 'short' });
        dataMap.set(key, 0);
      }
    } else if (selectedPeriod === 'month') {
      // Last 30 days (grouped by week)
      for (let i = 3; i >= 0; i--) {
        dataMap.set(`Week ${4 - i}`, 0);
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short' });
        dataMap.set(key, 0);
      }
    }

    // Fill in actual transaction data
    transactions.forEach(txn => {
      if (txn.status !== 'completed') return;
      
      const txnDate = new Date(txn.date);
      let key = '';

      if (selectedPeriod === 'week') {
        const daysDiff = Math.floor((now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
          key = txnDate.toLocaleDateString('en-US', { weekday: 'short' });
        }
      } else if (selectedPeriod === 'month') {
        const daysDiff = Math.floor((now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < 30) {
          const weekNum = Math.floor(daysDiff / 7);
          key = `Week ${4 - weekNum}`;
        }
      } else {
        const monthsDiff = (now.getFullYear() - txnDate.getFullYear()) * 12 + 
                          (now.getMonth() - txnDate.getMonth());
        if (monthsDiff < 12) {
          key = txnDate.toLocaleDateString('en-US', { month: 'short' });
        }
      }

      if (key && dataMap.has(key)) {
        dataMap.set(key, (dataMap.get(key) || 0) + txn.amount);
      }
    });

    return Array.from(dataMap.entries()).map(([name, earnings]) => ({
      name,
      earnings,
    }));
  };

  // Prepare data for completed vs pending comparison
  const prepareComparisonData = () => {
    return [
      { name: 'Completed', value: stats.totalEarnings, color: '#10b981' },
      { name: 'Pending', value: stats.pendingPayout, color: '#f59e0b' },
    ];
  };

  // Prepare data for earnings breakdown pie chart
  const prepareBreakdownData = () => {
    const grossEarnings = stats.totalEarnings;
    const platformFee = Math.round(grossEarnings * 0.08);
    const taxDeduction = Math.round(grossEarnings * 0.02);
    const netEarnings = Math.round(grossEarnings * 0.9);

    return [
      { name: 'Net Earnings', value: netEarnings, color: '#10b981' },
      { name: 'Platform Fee', value: platformFee, color: '#6366f1' },
      { name: 'Tax', value: taxDeduction, color: '#ef4444' },
    ];
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value: number; payload?: { name?: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {payload[0].name || payload[0].payload?.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pl-8 lg:pl-16 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading earnings data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pl-8 lg:pl-16 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-semibold">Error Loading Data</h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
              <button
                onClick={fetchEarningsData}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pl-8 lg:pl-16 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Earnings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your rental income and payouts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow">
            Request Payout
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded shadow">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {earningsStats.map((stat, i) => (
          <div key={i} className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center mb-2">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Earnings Chart Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Earnings Overview</h2>
          <div className="flex items-center space-x-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedPeriod === period
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Earnings Trend Line Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={prepareEarningsTrendData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="earnings" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 5 }}
              activeDot={{ r: 7 }}
              name="Earnings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Completed vs Pending */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Completed vs Pending</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={prepareComparisonData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Amount">
                {prepareComparisonData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Earnings Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={prepareBreakdownData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const RADIAN = Math.PI / 180;
                  const radius = (props.outerRadius as number) + 20;
                  const x = (props.cx as number) + radius * Math.cos(-((props.midAngle as number) * RADIAN));
                  const y = (props.cy as number) + radius * Math.sin(-((props.midAngle as number) * RADIAN));
                  const percent = ((props.value as number) / prepareBreakdownData().reduce((a, b) => a + b.value, 0)) * 100;
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill="#374151" 
                      textAnchor={x > (props.cx as number) ? 'start' : 'end'} 
                      dominantBaseline="central"
                      className="text-xs font-medium"
                    >
                      {`${percent.toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prepareBreakdownData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {prepareBreakdownData().map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  ₹{item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your latest earnings and payouts</p>
          </div>
          <button className="text-indigo-600 hover:underline text-sm">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Booking Details</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn.id} className="text-sm">
                    <td className="py-4 text-gray-900 dark:text-gray-100">
                      {new Date(txn.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-gray-100">{txn.booking}</span>
                        {txn.vehicle && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{txn.vehicle}</span>
                        )}
                        {txn.type === 'refund' && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded mt-1 inline-block w-fit">
                            Refund
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">{txn.customer}</td>
                    <td className={`py-4 font-semibold ${txn.type === 'refund' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {txn.type === 'refund' ? '-' : ''}₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 text-xs rounded-full capitalize ${getStatusBadge(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">📊</span>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Your earnings will appear here once you complete bookings
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Information */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Total Bookings</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.totalBookings}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Gross Earnings</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">₹{stats.totalEarnings.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Platform Fee (8%)</span>
              <span className="font-semibold text-red-600 dark:text-red-400">-₹{Math.round(stats.totalEarnings * 0.08).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Tax Deduction (2%)</span>
              <span className="font-semibold text-red-600 dark:text-red-400">-₹{Math.round(stats.totalEarnings * 0.02).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Net Earnings</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{Math.round(stats.totalEarnings * 0.9).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}