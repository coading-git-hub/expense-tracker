import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  PieChart, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Edit, 
  Filter,
  ArrowDownUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../componant/Navbar';

export default function Dashboard() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactionType, setTransactionType] = useState('expense');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  
  // Load saved transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('expenseTrackerTransactions');
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        setTransactions(parsedTransactions);
        
        // Calculate totals
        const income = parsedTransactions
          .filter(tx => tx.type === 'income')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const expenses = parsedTransactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        setTotalIncome(income);
        setTotalExpense(expenses);
        setBalance(income - expenses);
      } catch (error) {
        console.error('Failed to parse saved transactions', error);
      }
    }
  }, []);
  
  // Update totals whenever transactions change
  useEffect(() => {
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    setTotalIncome(income);
    setTotalExpense(expenses);
    setBalance(income - expenses);
    
    // Save to localStorage
    localStorage.setItem('expenseTrackerTransactions', JSON.stringify(transactions));
  }, [transactions]);
  
  const addTransaction = () => {
    if (!title || !amount) return;
    
    const newTransaction = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
      category: category,
      type: transactionType,
      createdAt: new Date().toISOString(),
    };
    
    setTransactions([...transactions, newTransaction]);
    setTitle('');
    setAmount('');
    setCategory('general');
    setTransactionType('expense');
    setIsAddingExpense(false);
  };
  
  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(tx => tx.id !== id));
  };
  
  const startEditing = (tx) => {
    setEditingId(tx.id);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category || 'general');
  };
  
  const saveEdit = () => {
    if (!editTitle || !editAmount) return;
    
    setTransactions(transactions.map(tx => 
      tx.id === editingId 
        ? {
            ...tx,
            title: editTitle,
            amount: parseFloat(editAmount),
            category: editCategory
          }
        : tx
    ));
    
    setEditingId(null);
  };
  
  const cancelEdit = () => {
    setEditingId(null);
  };
  
  const getCategoryEmoji = (category) => {
    const categories = {
      food: '🍔',
      transport: '🚗',
      entertainment: '🎬',
      shopping: '🛍️',
      bills: '📄',
      healthcare: '🏥',
      travel: '✈️',
      education: '📚',
      general: '📋'
    };
    
    return categories[category] || '📋';
  };
  
  const filteredTransactions = transactions.filter(tx => {
    if (filterCategory === 'all') return true;
    return tx.category === filterCategory;
  });
  
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.createdAt?.toDate?.() || new Date();
      const dateB = b.createdAt?.toDate?.() || new Date();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortBy === 'title') {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    }
    return 0;
  });
  
  // Calculate category totals for any UI elements that need it
  const categoryTotals = transactions.reduce((acc, tx) => {
    const cat = tx.category || 'general';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += tx.amount;
    return acc;
  }, {});
  
  // Group transactions by date for the line chart
  const getLastSevenDays = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push({
        date: date.toISOString().slice(0, 10),
        total: 0
      });
    }
    return result;
  };
  
  const dailyData = transactions.reduce((acc, tx) => {
    if (tx.createdAt) {
      const date = new Date(tx.createdAt).toISOString().slice(0, 10);
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.total += tx.amount;
      } else {
        acc.push({ date, total: tx.amount });
      }
    }
    return acc;
  }, getLastSevenDays());
  
  // Sort by date
  dailyData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">✨ Expense Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 text-blue-500 rounded-lg">
                <div className="font-bold text-xl">${balance.toFixed(2)}</div>
                <div className="text-xs">Current Balance</div>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data?')) {
                    localStorage.removeItem('expenseTrackerTransactions');
                    setTransactions([]);
                    setTotalIncome(0);
                    setTotalExpense(0);
                    setBalance(0);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-9">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
                <p className="text-2xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-500">${totalExpense.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Wallet size={20} /> Add Transaction
                </h2>
              </div>
              <button 
                onClick={() => setIsAddingExpense(!isAddingExpense)} 
                className="bg-blue-500 hover:bg-blue-600 text-white w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Plus size={20} />
                {isAddingExpense ? 'Cancel' : 'Add Transaction'}
              </button>
            </div>
            
            {/* Add transaction form */}
            {isAddingExpense && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Plus size={20} /> Add Transaction
                </h2>
                <div className="space-y-3">
                  {/* Transaction Type Selection */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setTransactionType('income')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        transactionType === 'income'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Income
                    </button>
                    <button
                      onClick={() => setTransactionType('expense')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        transactionType === 'expense'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Expense
                    </button>
                  </div>

                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    placeholder="Title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                  />
                  <input 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    placeholder="Amount" 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                  />
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="general">📋 General</option>
                    <option value="food">🍔 Food</option>
                    <option value="transport">🚗 Transport</option>
                    <option value="entertainment">🎬 Entertainment</option>
                    <option value="shopping">🛍️ Shopping</option>
                    <option value="bills">📄 Bills</option>
                    <option value="healthcare">🏥 Healthcare</option>
                    <option value="travel">✈️ Travel</option>
                    <option value="education">📚 Education</option>
                  </select>
                  <button 
                    onClick={addTransaction} 
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] ${
                      transactionType === 'income'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    <Plus size={20} />
                    Add {transactionType === 'income' ? 'Income' : 'Expense'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Category filter */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Filter size={20} /> Filter
              </h2>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="all">🔍 All Categories</option>
                <option value="general">📋 General</option>
                <option value="food">🍔 Food</option>
                <option value="transport">🚗 Transport</option>
                <option value="entertainment">🎬 Entertainment</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="bills">📄 Bills</option>
                <option value="healthcare">🏥 Healthcare</option>
                <option value="travel">✈️ Travel</option>
                <option value="education">📚 Education</option>
              </select>
            </div> 
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-2">
        
            <div className="flex mb-6 bg-white rounded-lg shadow-md p-1">
              <button 
                className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg transition-all ${activeTab === 'transactions' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('transactions')}
              >
                <Wallet size={18} />
                Transactions
              </button>
              <button 
                className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('analytics')}
              >
                <PieChart size={18} />
                Analytics
              </button>
            </div>
            
            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Recent Transactions</h2>
                   <div className="flex gap-2">
                    <button 
                      onClick={() => toggleSort('date')} 
                      className={`p-2 rounded-lg ${sortBy === 'date' ? 'bg-blue-100 text-blue-500' : 'hover:bg-gray-100'}`}
                      title="Sort by date"
                    >
                      <Calendar size={18} />
                    </button>
                    <button 
                      onClick={() => toggleSort('amount')} 
                      className={`p-2 rounded-lg ${sortBy === 'amount' ? 'bg-blue-100 text-blue-500' : 'hover:bg-gray-100'}`}
                      title="Sort by amount"
                    >
                      <ArrowDownUp size={18} />
                    </button>
                    <button 
                      onClick={() => toggleSort('title')} 
                      className={`p-2 rounded-lg ${sortBy === 'title' ? 'bg-blue-100 text-blue-500' : 'hover:bg-gray-100'}`}
                      title="Sort by title"
                    >
                      <ArrowDownUp size={18} />
                    </button>
                  </div> 
                </div>
                
                {sortedTransactions.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-6xl mb-4">🧾</p>
                    <p>No transactions found</p>
                    <p className="text-sm">Add your first expense to get started</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {sortedTransactions.map(tx => (
                      <li 
                        key={tx.id} 
                        className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getCategoryEmoji(tx.category || 'general')}
                            </span>
                            <div>
                              <p className="font-bold">{tx.title}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <p className={`font-semibold ${
                              tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </p>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => startEditing(tx)} 
                                className="p-2 text-blue-500 hover:text-blue-700"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => deleteTransaction(tx.id)} 
                                className="p-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Add Edit Form that appears when editing */}
                        {editingId === tx.id && (
                          <div className="mt-3 p-3 border-t border-gray-200">
                            <div className="space-y-3">
                              <input 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                              />
                              <input 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Amount"
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                              />
                              <select
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                              >
                                <option value="general">📋 General</option>
                                <option value="food">🍔 Food</option>
                                <option value="transport">🚗 Transport</option>
                                <option value="entertainment">🎬 Entertainment</option>
                                <option value="shopping">🛍️ Shopping</option>
                                <option value="bills">📄 Bills</option>
                                <option value="healthcare">🏥 Healthcare</option>
                                <option value="travel">✈️ Travel</option>
                                <option value="education">📚 Education</option>
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEdit}
                                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Daily expenses chart */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} /> Daily Expenses
                  </h2>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData}>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => {
                            const d = new Date(date);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                          }}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Expense']}
                          labelFormatter={(date) => `Date: ${new Date(date).toLocaleDateString()}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#3B82F6" 
                          strokeWidth={2} 
                          dot={{ fill: '#3B82F6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Category breakdown */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <PieChart size={20} /> Category Breakdown
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(categoryTotals).map(([category, amount]) => (
                      <div 
                        key={category}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryEmoji(category)}</span>
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <span className="font-bold">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Summary stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp size={18} /> Highest Expense
                    </h2>
                    
                    {transactions.length > 0 ? (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getCategoryEmoji(
                              transactions.reduce((max, tx) => max.amount > tx.amount ? max : tx, transactions[0]).category || 'general'
                            )}
                          </span>
                          <span>
                            {transactions.reduce((max, tx) => max.amount > tx.amount ? max : tx, transactions[0]).title}
                          </span>
                        </div>
                        <span className="font-bold text-red-500">
                          ${transactions.reduce((max, tx) => max.amount > tx.amount ? max : tx, transactions[0]).amount.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <TrendingDown size={18} /> Lowest Expense
                    </h2>
                    
                    {transactions.length > 0 ? (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getCategoryEmoji(
                              transactions.reduce((min, tx) => min.amount < tx.amount ? min : tx, transactions[0]).category || 'general'
                            )}
                          </span>
                          <span>
                            {transactions.reduce((min, tx) => min.amount < tx.amount ? min : tx, transactions[0]).title}
                          </span>
                        </div>
                        <span className="font-bold text-green-500">
                          ${transactions.reduce((min, tx) => min.amount < tx.amount ? min : tx, transactions[0]).amount.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
