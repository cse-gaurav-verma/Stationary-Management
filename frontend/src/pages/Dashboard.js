import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalRequests: 0,
    pendingRequests: 0,
    myRequests: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');

      try {
        const inventoryResponse = await api.get('/api/inventory', {
          params: { page: 0, size: 1, sortBy: 'name' },
        });

        const totalItems = inventoryResponse.data?.totalElements ?? 0;
        let lowStock = 0;
        let totalRequests = 0;
        let pendingRequests = 0;
        let myRequests = 0;

        if (user?.role === 'ADMIN') {
          const lowResponse = await api.get('/api/inventory/low-stock');
          lowStock = Number(lowResponse.data?.length ?? 0);

          const allRequests = await api.get('/api/requests');
          totalRequests = Number(allRequests.data?.length ?? 0);
          pendingRequests = Number(
            allRequests.data?.filter((request) => request.status === 'PENDING')?.length ?? 0
          );
        } else {
          const myResponse = await api.get('/api/requests/my');
          myRequests = Number(myResponse.data?.length ?? 0);
          pendingRequests = Number(
            myResponse.data?.filter((request) => request.status === 'PENDING')?.length ?? 0
          );
        }

        setStats({ totalItems, lowStock, totalRequests, pendingRequests, myRequests });
      } catch (err) {
        setError('Unable to load dashboard stats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.role]);

  return (
    <div className="dashboard-root">
      <div className="dashboard-header page-card">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            {user?.role === 'ADMIN'
              ? 'Admin overview of inventory and request activity.'
              : 'Student overview of inventory and your requests.'}
          </p>
        </div>

        <div className="dashboard-actions">
          {user?.role !== 'ADMIN' && (
            <Link className="btn btn-primary" to="/requests/new">
              New Request
            </Link>
          )}

          <Link className="btn btn-secondary" to="/inventory">
            View Inventory
          </Link>

          {user?.role === 'ADMIN' && (
            <>
              <Link className="btn btn-secondary" to="/requests/manage">
                Manage Requests
              </Link>
              <Link className="btn btn-primary" to="/inventory/add">
                Add Inventory
              </Link>
            </>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-grid">
        <aside className="dashboard-main page-card">
          <h2 className="small-title">Summary</h2>
          <div className="summary-block">
            <div className="summary-label">Inventory Items</div>
            <div className="summary-value">{stats.totalItems}</div>
          </div>

          <div className="summary-block">
            <div className="summary-label">Pending Requests</div>
            <div className="summary-value">{stats.pendingRequests}</div>
          </div>

          {user?.role === 'ADMIN' ? (
            <>
              <div className="summary-block">
                <div className="summary-label">Low Stock</div>
                <div className="summary-value">{stats.lowStock}</div>
              </div>
              <div className="summary-block">
                <div className="summary-label">Total Requests</div>
                <div className="summary-value">{stats.totalRequests}</div>
              </div>
            </>
          ) : (
            <div className="summary-block">
              <div className="summary-label">My Requests</div>
              <div className="summary-value">{stats.myRequests}</div>
            </div>
          )}
        </aside>

        <section className="dashboard-side page-card">
          <h2 className="small-title">Quick Actions & Info</h2>
          <div className="side-grid">
            <div className="side-card">
              <div className="side-title">Recent Activity</div>
              <div className="side-body">No recent activity to show.</div>
            </div>

            <div className="side-card">
              <div className="side-title">Notes</div>
              <div className="side-body">Use the actions above to manage inventory and requests.</div>
            </div>
          </div>
        </section>
      </div>

      {loading && <div className="page-loading">Loading dashboard...</div>}
    </div>
  );
};

export default Dashboard;
