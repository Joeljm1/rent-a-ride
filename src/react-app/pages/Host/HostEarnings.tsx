import React, { useState, useEffect } from "react";
import type { EarningsStats, Transaction, PayoutInfo } from "./types";
import client from "../../lib/client";

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
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo>({
    nextPayoutDate: null,
    pendingAmount: 0,
    payoutMethod: "Bank Transfer",
  });
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
      const payoutData = await payoutRes.json();

      setStats(statsData);
      setTransactions((transactionsData.transactions || []) as Transaction[]);
      setPayoutInfo(payoutData);
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
      label: "Pending Payouts",
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
        
        {/* Chart Placeholder */}
        <div className="h-64 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Earnings chart will be displayed here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Showing data for {selectedPeriod}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Payout Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Next Payout</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {payoutInfo.nextPayoutDate
                    ? new Date(payoutInfo.nextPayoutDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Not scheduled'}
                </p>
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{payoutInfo.pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Method</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏦</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{payoutInfo.payoutMethod}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Configure in settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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