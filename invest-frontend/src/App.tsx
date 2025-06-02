import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import HistoryLog from './HistoryLog';

const USERS = [
  { username: 'nico', password: 'nico', startBalance: 1000000 },
  { username: 'viki', password: 'viki', startBalance: 2000000 },
];
const SYMBOLS = ['BTC', 'ETH'];

interface Investment {
  id: number;
  type: 'stock' | 'crypto';
  symbol: string;
  quantity: number;
  price: number;
  user: string;
}

function App() {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('user'));
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [form, setForm] = useState<Omit<Investment, 'id' | 'user'>>({
    type: 'crypto',
    symbol: '',
    quantity: 0,
    price: 0,
  });
  const [editId, setEditId] = useState<number | null>(null);

  const getWallet = () => {
    if (!user) return 0;
    const local = localStorage.getItem(`${user}-wallet`);
    if (local !== null) return Number(local);
    const config = USERS.find((u) => u.username === user);
    if (config) {
      localStorage.setItem(`${user}-wallet`, String(config.startBalance));
      return config.startBalance;
    }
    return 0;
  };
  const [walletBalance, setWalletBalance] = useState<number>(getWallet());

  const [priceData, setPriceData] = useState<
      { date: string; BTC: number; ETH: number }[]
  >([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', user);
      setWalletBalance(getWallet());
      fetchInvestments();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (form.symbol && priceData.length > 0) {
      const last = priceData[priceData.length - 1];
      setForm((old) => ({
        ...old,
        price:
            form.symbol === 'BTC'
                ? last.BTC
                : form.symbol === 'ETH'
                    ? last.ETH
                    : 0,
      }));
    }
    // eslint-disable-next-line
  }, [form.symbol, priceData]);

  const fetchInvestments = () => {
    const raw = localStorage.getItem('investments');
    let all: Investment[] = raw ? JSON.parse(raw) : [];
    setInvestments(all.filter((inv) => inv.user === user));
  };

  const fetchPriceChartData = async () => {
    try {
      const btcRes = await axios.get(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7'
      );
      const ethRes = await axios.get(
          'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7'
      );
      const btcPrices: [number, number][] = btcRes.data.prices;
      const ethPrices: [number, number][] = ethRes.data.prices;
      const combined: { date: string; BTC: number; ETH: number }[] = btcPrices.map(
          ([timeStamp, btcPrice], idx) => {
            const date = new Date(timeStamp).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
            });
            const ethPrice = ethPrices[idx] ? ethPrices[idx][1] : 0;
            return {
              date,
              BTC: parseFloat(btcPrice.toFixed(2)),
              ETH: parseFloat(ethPrice.toFixed(2)),
            };
          }
      );
      setPriceData(combined);
    } catch (err) {
      console.error('Error fetching price chart data:', err);
    }
  };

  useEffect(() => {
    fetchPriceChartData();
    // eslint-disable-next-line
  }, []);

  // LOGIN LOGIC
  const handleLogin = () => {
    const found = USERS.find(
        (u) =>
            u.username === loginInput.username &&
            u.password === loginInput.password
    );
    if (!found) {
      setLoginError('Wrong username or password!');
      return;
    }
    setLoginError(null);
    setUser(found.username);
    if (localStorage.getItem(`${found.username}-wallet`) === null) {
      localStorage.setItem(`${found.username}-wallet`, String(found.startBalance));
    }
  };

  // INVESTMENT LOGIC
  const handleSubmit = async () => {
    if (!user) return;
    const purchaseCost = form.quantity * form.price;
    if (editId === null && purchaseCost > walletBalance) {
      alert('Not enough funds in wallet for this purchase!');
      return;
    }
    let all: Investment[] = JSON.parse(localStorage.getItem('investments') || '[]');
    if (editId !== null) {
      all = all.map((inv) =>
          inv.id === editId ? { ...inv, ...form, user } : inv
      );
    } else {
      const newId = Date.now();
      all.push({ ...form, id: newId, user });
      localStorage.setItem(
          `${user}-wallet`,
          String(walletBalance - purchaseCost)
      );
      setWalletBalance(walletBalance - purchaseCost);
    }
    localStorage.setItem('investments', JSON.stringify(all));
    setForm({ type: 'crypto', symbol: '', quantity: 0, price: 0 });
    setEditId(null);
    fetchInvestments();
  };

  const handleDelete = (id: number) => {
    let all: Investment[] = JSON.parse(localStorage.getItem('investments') || '[]');
    const investment = all.find((inv) => inv.id === id);
    if (investment && investment.user === user) {
      localStorage.setItem(
          `${user}-wallet`,
          String(walletBalance + investment.quantity * investment.price)
      );
      setWalletBalance(walletBalance + investment.quantity * investment.price);
    }
    all = all.filter((inv) => inv.id !== id);
    localStorage.setItem('investments', JSON.stringify(all));
    fetchInvestments();
  };

  const handleEdit = (inv: Investment) => {
    setForm({
      type: inv.type,
      symbol: inv.symbol,
      quantity: inv.quantity,
      price: inv.price,
    });
    setEditId(inv.id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const totalValue = investments
      .reduce((sum, inv) => sum + inv.quantity * inv.price, 0)
      .toFixed(2);

  // ---------- LOGIN FORM BLOCK ----------
  if (!user) {
    return (
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="card shadow border-primary">
                <div className="card-body text-center">
                  <h2 className="mb-4">🔐 Login</h2>
                  <input
                      className="form-control mb-2"
                      placeholder="Username"
                      value={loginInput.username}
                      onChange={e =>
                          setLoginInput((old) => ({ ...old, username: e.target.value }))
                      }
                      autoFocus
                  />
                  <input
                      className="form-control mb-3"
                      type="password"
                      placeholder="Password"
                      value={loginInput.password}
                      onChange={e =>
                          setLoginInput((old) => ({ ...old, password: e.target.value }))
                      }
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                      className="btn btn-primary w-100"
                      disabled={!loginInput.username || !loginInput.password}
                      onClick={handleLogin}
                  >
                    Login
                  </button>
                  {loginError && (
                      <div className="text-danger mt-2">{loginError}</div>
                  )}
                  <div className="mt-3 text-muted small">
                    <div><b>nico</b> / <b>nico</b> ($1,000,000)</div>
                    <div><b>viki</b> / <b>viki</b> ($2,000,000)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  // ---------- MAIN APP ----------
  return (
      <div className="container py-4">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="display-5 text-primary">📊 Моите инвестиции</h1>
          <div>
          <span className="badge bg-success fs-5">
            Wallet Balance: ${walletBalance.toLocaleString()}
          </span>
          </div>
          <div className="mt-2">
            <span className="text-muted me-2">User: <b>{user}</b></span>
            <button className="btn btn-link" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Form */}
        <div className="card mb-4 shadow-sm border-primary">
          <div className="card-body">
            <form
                className="row g-3 align-items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
            >
              <div className="col-12 col-sm-3">
                <label className="form-label">Type</label>
                <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) =>
                        setForm({ ...form, type: e.target.value as 'stock' | 'crypto' })
                    }
                >
                  <option value="crypto">Crypto</option>
                </select>
              </div>
              <div className="col-12 col-sm-3">
                <label className="form-label">Symbol</label>
                <select
                    className="form-select"
                    value={form.symbol}
                    onChange={e => setForm({ ...form, symbol: e.target.value })}
                    required
                >
                  <option value="">Select...</option>
                  {SYMBOLS.map((sym) => (
                      <option key={sym} value={sym}>{sym}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-sm-2">
                <label className="form-label">Quantity</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={form.quantity}
                    onChange={e =>
                        setForm({ ...form, quantity: parseFloat(e.target.value) })
                    }
                    required
                    min="0"
                    step="any"
                />
              </div>
              <div className="col-6 col-sm-2">
                <label className="form-label">Price (auto)</label>
                <input
                    type="number"
                    className="form-control"
                    value={form.price}
                    readOnly
                    disabled
                />
              </div>
              <div className="col-12 col-sm-2 d-grid">
                <button
                    type="submit"
                    className={`btn btn-${editId !== null ? 'success' : 'primary'} w-100`}
                >
                  {editId !== null ? '💾 Update' : '➕ Add'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Investments Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
            <tr>
              <th scope="col">Type</th>
              <th scope="col">Symbol</th>
              <th scope="col">Quantity</th>
              <th scope="col">Price</th>
              <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            {investments.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.type.toUpperCase()}</td>
                  <td>{inv.symbol}</td>
                  <td>{inv.quantity}</td>
                  <td>${inv.price}</td>
                  <td>
                    <button
                        onClick={() => handleEdit(inv)}
                        className="btn btn-warning btn-sm me-2"
                    >
                      ✏️ Edit
                    </button>
                    <button
                        onClick={() => handleDelete(inv.id)}
                        className="btn btn-danger btn-sm"
                    >
                      🗑️ Sell
                    </button>
                  </td>
                </tr>
            ))}
            {investments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No investments found.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* History Log */}
        <HistoryLog />

        {/* Chart */}
        <div className="card mt-5 shadow-sm border-primary">
          <div className="card-body">
            <h5 className="card-title mb-3">
              Chart: BTC & ETH Prices (last 7 days)
            </h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                  data={priceData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `$${val}`} />
                <Tooltip formatter={(value: number) => `$${value}`} />
                <Legend verticalAlign="top" height={36} />
                <Line
                    type="monotone"
                    dataKey="BTC"
                    name="Bitcoin"
                    stroke="#f2a900"
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="ETH"
                    name="Ethereum"
                    stroke="#3c3c3d"
                    dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  );
}

export default App;
