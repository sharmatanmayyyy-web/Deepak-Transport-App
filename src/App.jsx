import React, { useState } from 'react';
import { LogOut, Plus, MapPin, AlertCircle, Eye, EyeOff, BarChart3 } from 'lucide-react';

export default function FleetExpenseApp() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '', role: 'driver' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', phone: '', role: 'driver' });
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newExpense, setNewExpense] = useState({
    category: 'fuel',
    amount: '',
    description: '',
    tripId: '',
    receipt: null,
    timestamp: new Date().toISOString()
  });

  const [filters, setFilters] = useState({
    person: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedExpense, setSelectedExpense] = useState(null);

  const categories = ['fuel', 'toll', 'food', 'maintenance', 'cleaning', 'other'];
  const categoryEmojis = {
    fuel: '⛽',
    toll: '🛣️',
    food: '🍽️',
    maintenance: '🔧',
    cleaning: '🧹',
    other: '📌'
  };

  const getLocation = () => {
    setLoading(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toLocaleString()
          };
          setCurrentLocation(location);
          setLoading(false);
        },
        (error) => {
          setLocationError('Unable to get location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation not supported on this device');
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (loginData.email && loginData.password.length >= 4) {
        setUser({
          id: Math.random().toString(),
          email: loginData.email,
          role: loginData.role,
          name: loginData.email.split('@')[0]
        });
        setShowLoginForm(false);
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (signupData.email && signupData.password.length >= 4) {
        setUser({
          id: Math.random().toString(),
          email: signupData.email,
          role: signupData.role,
          name: signupData.name
        });
        setShowSignup(false);
        setShowLoginForm(false);
      }
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
    setLoading(false);
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.tripId) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const expenseData = {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      location: currentLocation,
      id: Date.now()
    };
    try {
      setExpenses([...expenses, expenseData]);
      setNewExpense({
        category: 'fuel',
        amount: '',
        description: '',
        tripId: '',
        receipt: null,
        timestamp: new Date().toISOString()
      });
      setCurrentLocation(null);
      alert('Expense submitted successfully!');
    } catch (error) {
      alert('Failed to submit expense: ' + error.message);
    }
    setLoading(false);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (user.role === 'driver' || user.role === 'manager') {
      if (expense.userId !== user.id) return false;
    }
    if (filters.person !== 'all' && expense.userRole !== filters.person) return false;
    if (filters.category !== 'all' && expense.category !== filters.category) return false;
    return true;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = filteredExpenses.length > 0 ? (totalExpense / filteredExpenses.length).toFixed(0) : 0;
  const expensesByPerson = {};
  filteredExpenses.forEach(e => {
    if (!expensesByPerson[e.userRole]) expensesByPerson[e.userRole] = 0;
    expensesByPerson[e.userRole] += e.amount;
  });

  const logout = () => {
    setUser(null);
    setShowLoginForm(true);
    setExpenses([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Fleet Expense</h1>
          <p className="text-center text-gray-600 mb-8">Track spending, monitor drivers & managers</p>

          {showSignup ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sign Up</h2>
              <input type="text" placeholder="Full Name" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="email" placeholder="Email" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="tel" placeholder="Phone Number" value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <select value={signupData.role} onChange={(e) => setSignupData({...signupData, role: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="driver">Driver</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner/Admin</option>
              </select>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Creating...' : 'Sign Up'}</button>
              <button type="button" onClick={() => setShowSignup(false)} className="w-full text-blue-600 py-2 font-semibold hover:underline">Back to Login</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Login</h2>
              <input type="email" placeholder="Email" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <select value={loginData.role} onChange={(e) => setLoginData({...loginData, role: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="driver">Driver</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner/Admin</option>
              </select>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Logging in...' : 'Login'}</button>
              <button type="button" onClick={() => setShowSignup(true)} className="w-full text-blue-600 py-2 font-semibold hover:underline">Create New Account</button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-300">
            <p className="text-xs text-gray-500 text-center mb-3">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Owner:</strong> owner@fleet.com / pass1234</p>
              <p><strong>Driver:</strong> driver@fleet.com / pass1234</p>
              <p><strong>Manager:</strong> manager@fleet.com / pass1234</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'driver' || user.role === 'manager') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
            <div><h1 className="text-2xl font-bold">Submit Expense</h1><p className="text-sm opacity-90">{user.name} ({user.role})</p></div>
            <button onClick={logout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2"><LogOut size={18} /> Logout</button>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={22} /> New Expense</h2>
            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Trip ID *</label><input type="text" placeholder="e.g., T001" value={newExpense.tripId} onChange={(e) => setNewExpense({...newExpense, tripId: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label><select value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">{categories.map(cat => (<option key={cat} value={cat}>{categoryEmojis[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</option>))}</select></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label><input type="number" placeholder="0.00" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" required /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Description</label><textarea placeholder="e.g., CNG refill" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" /></div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><button type="button" onClick={getLocation} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-gray-400"><MapPin size={18} /> {loading ? 'Getting Location...' : 'Capture Location'}</button>{locationError && <p className="text-red-600 text-sm mt-2 flex items-center gap-1"><AlertCircle size={16} /> {locationError}</p>}{currentLocation && <div className="mt-3 bg-white rounded p-3 text-sm"><p className="text-gray-700"><strong>📍 Location Captured</strong></p><p className="text-gray-600 text-xs">{currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</p></div>}</div>
              <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"><Plus size={20} /> {loading ? 'Submitting...' : 'Submit Expense'}</button>
            </form>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6"><h2 className="text-xl font-bold text-gray-800 mb-4">My Recent Expenses</h2>{filteredExpenses.length === 0 ? <p className="text-gray-500 text-center py-8">No expenses submitted yet</p> : <div className="space-y-3">{filteredExpenses.slice().reverse().map(expense => (<div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"><div className="flex justify-between items-start"><div><p className="font-semibold">{categoryEmojis[expense.category]} {expense.category} - Trip {expense.tripId}</p><p className="text-sm text-gray-600">{expense.description}</p></div><p className="text-lg font-bold text-green-600">₹{expense.amount}</p></div></div>))}</div>}</div>
        </div>
      </div>
    );
  }

  if (user.role === 'owner') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div><h1 className="text-2xl font-bold">Fleet Monitoring</h1><p className="text-sm opacity-90">Monitor all expenses in real-time</p></div>
            <button onClick={logout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2"><LogOut size={18} /> Logout</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6"><p className="text-gray-600 text-sm font-semibold mb-2">Total Expenses</p><p className="text-3xl font-bold text-blue-600">₹{totalExpense.toFixed(0)}</p></div>
            <div className="bg-white rounded-lg shadow p-6"><p className="text-gray-600 text-sm font-semibold mb-2">Driver Spend</p><p className="text-3xl font-bold text-orange-600">₹{(expensesByPerson['driver'] || 0).toFixed(0)}</p></div>
            <div className="bg-white rounded-lg shadow p-6"><p className="text-gray-600 text-sm font-semibold mb-2">Manager Spend</p><p className="text-3xl font-bold text-purple-600">₹{(expensesByPerson['manager'] || 0).toFixed(0)}</p></div>
            <div className="bg-white rounded-lg shadow p-6"><p className="text-gray-600 text-sm font-semibold mb-2">Total Transactions</p><p className="text-3xl font-bold text-green-600">{filteredExpenses.length}</p></div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6"><h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={18} /> All Expenses</h3>{filteredExpenses.length === 0 ? <p className="text-gray-500 text-center py-8">No expenses yet</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="px-4 py-3 text-left">Person</th><th className="px-4 py-3 text-left">Trip</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Description</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-left">Time</th></tr></thead><tbody>{filteredExpenses.slice().reverse().map(expense => (<tr key={expense.id} className="border-t hover:bg-gray-50"><td className="px-4 py-3 font-semibold capitalize">{expense.userName}</td><td className="px-4 py-3 font-bold">{expense.tripId}</td><td className="px-4 py-3">{categoryEmojis[expense.category]}</td><td className="px-4 py-3 text-gray-600">{expense.description}</td><td className="px-4 py-3 text-right font-bold text-green-600">₹{expense.amount}</td><td className="px-4 py-3 text-xs text-gray-500">{new Date(expense.timestamp).toLocaleString()}</td></tr>))}</tbody></table></div>}</div>
        </div>
      </div>
    );
  }
}
