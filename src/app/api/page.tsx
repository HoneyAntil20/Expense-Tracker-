'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Wallet, 
  Users, 
  Send, 
  CheckCircle2, 
  X, 
  ChevronRight,
  TrendingUp,
  Mail,
  PieChart,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  name: string;
  email: string;
  currency: string;
}

interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit';
  method: 'UPI' | 'Cash';
  isSplit: boolean;
  friends: string[]; // Support multiple friends
  status?: 'pending' | 'paid';
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('debit');
  const [method, setMethod] = useState<'UPI' | 'Cash'>('UPI');
  const [isSplit, setIsSplit] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friends, setFriends] = useState<string[]>([]);

  // Onboarding states
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingEmail, setOnboardingEmail] = useState('');
  const [onboardingCurrency, setOnboardingCurrency] = useState('₹');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, expenseRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/expenses')
        ]);
        const userData = await userRes.json();
        const expenseData = await expenseRes.json();
        
        setUser(userData);
        setExpenses(expenseData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = { name: onboardingName, email: onboardingEmail, currency: onboardingCurrency };
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) setUser(newUser);
  };

  const resetForm = () => {
    setEditingId(null);
    setCategory('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsSplit(false);
    setFriends([]);
    setFriendEmail('');
    setType('debit');
    setMethod('UPI');
  };

  const handleAddOrUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    const expenseData = {
      id: editingId || undefined,
      date,
      category,
      amount: parseFloat(amount),
      type,
      method,
      isSplit,
      friends: isSplit ? friends : [],
      status: isSplit ? 'pending' : 'paid'
    };

    const res = await fetch('/api/expenses', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });

    if (res.ok) {
      const saved = await res.json();
      if (editingId) {
        setExpenses(expenses.map(e => e.id === editingId ? saved : e));
      } else {
        setExpenses([saved, ...expenses]);
      }
      resetForm();
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setCategory(expense.category);
    setAmount(expense.amount.toString());
    setDate(expense.date);
    setType(expense.type);
    setMethod(expense.method);
    setIsSplit(expense.isSplit);
    setFriends(expense.friends || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const addFriend = () => {
    if (friendEmail && !friends.includes(friendEmail)) {
      setFriends([...friends, friendEmail]);
      setFriendEmail('');
    }
  };

  const removeFriend = (email: string) => {
    setFriends(friends.filter(f => f !== email));
  };

  const sendReminder = async (expense: Expense, email: string) => {
    const res = await fetch('/api/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        friendEmail: email,
        amount: (expense.amount / (expense.friends.length + 1)).toFixed(2),
        category: expense.category,
        date: expense.date
      }),
    });

    if (res.ok) {
      alert(`Reminder sent to ${email}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#111] border border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-cyan-500/10 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome</h1>
        <p className="text-zinc-400 text-center mb-8">Let's set up your futuristic expense command center.</p>
        
        <form onSubmit={handleOnboarding} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Full Name</label>
            <input
              required
              value={onboardingName}
              onChange={(e) => setOnboardingName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email Address</label>
            <input
              required
              type="email"
              value={onboardingEmail}
              onChange={(e) => setOnboardingEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Currency Symbol</label>
            <select
              value={onboardingCurrency}
              onChange={(e) => setOnboardingCurrency(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
            >
              <option value="₹">₹ (INR)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Launch Experience
          </button>
        </form>
      </motion.div>
    </div>
  );

  // Dynamic Insights Calculations
  const totalBalance = expenses.reduce((acc, curr) => {
    // If debit, subtract my share. If credit, add full amount.
    const myShare = curr.isSplit ? (curr.amount / (curr.friends.length + 1)) : curr.amount;
    return curr.type === 'credit' ? acc + curr.amount : acc - myShare;
  }, 0);

  const totalSpent = expenses
    .filter(e => e.type === 'debit')
    .reduce((acc, curr) => acc + (curr.isSplit ? (curr.amount / (curr.friends.length + 1)) : curr.amount), 0);

  const sharedBillsCount = expenses.filter(e => e.isSplit).length;
  
  const monthlyAverage = expenses.length > 0 
    ? totalSpent / (new Set(expenses.map(e => e.date.substring(0, 7))).size || 1)
    : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar / Stats */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(6,182,212,0.2)]"
          >
            <div className="flex justify-between items-start mb-12">
              <Wallet className="w-10 h-10 text-white/80" />
              <div className="text-right">
                <p className="text-white/60 text-sm font-medium uppercase tracking-widest">My Balance</p>
                <h2 className="text-4xl font-bold">{user.currency}{totalBalance.toLocaleString()}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-2/3" />
              </div>
              <span className="text-xs font-bold text-white/80">LIVE STATUS</span>
            </div>
          </motion.div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Quick Insights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                <span className="text-zinc-400">Monthly Average</span>
                <span className="font-bold">{user.currency}{monthlyAverage.toFixed(0)}</span>
              </div>
              <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                <span className="text-zinc-400">Shared Bills</span>
                <span className="font-bold text-cyan-400">{sharedBillsCount}</span>
              </div>
              <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                <span className="text-zinc-400">Total Spent</span>
                <span className="font-bold text-red-400">{user.currency}{totalSpent.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Hello, {user.name.split(' ')[0]}</h1>
              <p className="text-zinc-500">Manage your galactic wealth.</p>
            </div>
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/10">
              <span className="text-cyan-400 font-bold">{user.name[0]}</span>
            </div>
          </div>

          {/* Form */}
          <motion.div 
            layout
            className="bg-[#111] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden"
          >
            {editingId && (
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 animate-pulse" />
            )}
            <form onSubmit={handleAddOrUpdateExpense} className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {editingId ? <Edit2 className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-cyan-400" />}
                  {editingId ? 'Edit Transaction' : 'New Transaction'}
                </h3>
                {editingId && (
                  <button onClick={resetForm} className="text-xs text-zinc-500 hover:text-white uppercase font-bold">Cancel Edit</button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2 block">Category / Description</label>
                  <input
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="New Starship Fuel..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400 font-bold">{user.currency}</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2 block">Type</label>
                  <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                    <button 
                      type="button"
                      onClick={() => setType('debit')}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition", type === 'debit' ? "bg-red-500 text-white" : "text-zinc-500")}
                    >DEBIT</button>
                    <button 
                      type="button"
                      onClick={() => setType('credit')}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition", type === 'credit' ? "bg-green-500 text-white" : "text-zinc-500")}
                    >CREDIT</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2 block">Method</label>
                  <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                    <button 
                      type="button"
                      onClick={() => setMethod('UPI')}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1", method === 'UPI' ? "bg-white text-black" : "text-zinc-500")}
                    ><CreditCard className="w-3 h-3" /> UPI</button>
                    <button 
                      type="button"
                      onClick={() => setMethod('Cash')}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1", method === 'Cash' ? "bg-white text-black" : "text-zinc-500")}
                    ><Banknote className="w-3 h-3" /> CASH</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2 block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 cursor-pointer" onClick={() => setIsSplit(!isSplit)}>
                  <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition", isSplit ? "bg-cyan-500 border-cyan-500" : "border-white/20")}>
                    {isSplit && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                  <span className="text-sm font-medium">Split Bill with friends?</span>
                </div>
                
                <AnimatePresence>
                  {isSplit && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={friendEmail}
                          onChange={(e) => setFriendEmail(e.target.value)}
                          placeholder="Friend's Email"
                          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <button 
                          type="button"
                          onClick={addFriend}
                          className="px-6 bg-cyan-500 text-black font-bold rounded-2xl hover:bg-cyan-400"
                        >Add</button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {friends.map(f => (
                          <div key={f} className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                            {f}
                            <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => removeFriend(f)} />
                          </div>
                        ))}
                      </div>
                      {friends.length > 0 && (
                        <p className="text-xs text-zinc-500">
                          Each person will pay: <span className="text-white font-bold">{user.currency}{(parseFloat(amount || '0') / (friends.length + 1)).toFixed(2)}</span>
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                type="submit"
                className="w-full md:w-auto px-12 bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition flex items-center justify-center gap-2"
              >
                {editingId ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'Update Transaction' : 'Confirm Transaction'}
              </button>
            </form>
          </motion.div>

          {/* List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-2">Transactions History</h3>
            <div className="space-y-3">
              {expenses.map((expense) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={expense.id}
                  className="bg-[#111] border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between group hover:border-cyan-500/30 transition"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      expense.type === 'credit' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {expense.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">{expense.category}</h4>
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-zinc-500 uppercase font-bold">{expense.method}</span>
                      </div>
                      <p className="text-xs text-zinc-500 uppercase tracking-tighter">{expense.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={cn(
                        "text-xl font-bold",
                        expense.type === 'credit' ? "text-green-400" : "text-white"
                      )}>
                        {expense.type === 'credit' ? '+' : '-'}{user.currency}{expense.amount.toLocaleString()}
                      </p>
                      {expense.isSplit && (
                        <p className="text-[10px] text-cyan-400 uppercase font-bold">Split with {expense.friends?.length || 0} friends</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      {expense.isSplit && (
                        <button 
                          onClick={() => expense.friends.forEach(f => sendReminder(expense, f))}
                          className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 hover:bg-cyan-500 hover:text-black"
                          title="Remind All"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(expense)}
                        className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:bg-white hover:text-black"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="p-3 bg-red-500/10 rounded-xl text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
