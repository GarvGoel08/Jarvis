import React, { useState, useEffect } from 'react';
import { X, Server, Activity, Users, RefreshCw } from 'lucide-react';
import './SystemInfo.css';

const SystemInfo = ({ onClose }) => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [agentInfo, setAgentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch health status
      const healthResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/health`);
      if (!healthResponse.ok) throw new Error('Failed to fetch health status');
      const healthData = await healthResponse.json();

      // Fetch agent information
      const agentsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/agents`);
      if (!agentsResponse.ok) throw new Error('Failed to fetch agent info');
      const agentsData = await agentsResponse.json();

      setSystemInfo(healthData);
      setAgentInfo(agentsData);
    } catch (err) {
      console.error('Error fetching system info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="system-info-overlay">
      <div className="system-info-panel">
        <div className="panel-header">
          <h3>
            <Server size={20} />
            System Information
          </h3>
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={fetchSystemInfo}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="panel-content">
          {loading && (
            <div className="loading-state">
              <RefreshCw className="spinner" size={20} />
              <span>Loading system information...</span>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={fetchSystemInfo} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && systemInfo && (
            <>
              {/* Server Status */}
              <div className="info-section">
                <h4>
                  <Activity size={16} />
                  Server Status
                </h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className={`value status ${systemInfo.status}`}>
                      {systemInfo.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Uptime:</span>
                    <span className="value">{formatUptime(systemInfo.uptime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">MongoDB:</span>
                    <span className={`value status ${systemInfo.mongodb === 'connected' ? 'healthy' : 'error'}`}>
                      {systemInfo.mongodb}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Agents:</span>
                    <span className={`value status ${systemInfo.agents === 'initialized' ? 'healthy' : 'warning'}`}>
                      {systemInfo.agents}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent Information */}
              {agentInfo && (
                <div className="info-section">
                  <h4>
                    <Users size={16} />
                    Agent System
                  </h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Available Agents:</span>
                      <span className="value">{agentInfo.availableAgents?.length || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Total Tasks:</span>
                      <span className="value">{agentInfo.stats?.totalTasks || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Active Agents:</span>
                      <span className="value">{agentInfo.stats?.activeAgents?.length || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Avg Processing:</span>
                      <span className="value">
                        {agentInfo.stats?.avgProcessingTime 
                          ? `${(agentInfo.stats.avgProcessingTime / 1000).toFixed(2)}s`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Available Agents List */}
                  {agentInfo.availableAgents && agentInfo.availableAgents.length > 0 && (
                    <div className="agents-list">
                      <h5>Available Agents:</h5>
                      {agentInfo.availableAgents.map((agent, index) => (
                        <div key={index} className="agent-item">
                          <div className="agent-header">
                            <span className="agent-name">{agent.name}</span>
                            <span className={`agent-status ${agent.status || 'implemented'}`}>
                              {agent.status || 'implemented'}
                            </span>
                          </div>
                          <p className="agent-description">{agent.description}</p>
                          {agent.capabilities && agent.capabilities.length > 0 && (
                            <div className="agent-capabilities">
                              {agent.capabilities.slice(0, 3).map((capability, capIndex) => (
                                <span key={capIndex} className="capability-tag">
                                  {capability}
                                </span>
                              ))}
                              {agent.capabilities.length > 3 && (
                                <span className="capability-tag more">
                                  +{agent.capabilities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Environment Info */}
              <div className="info-section">
                <h4>Environment</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">App Name:</span>
                    <span className="value">{import.meta.env.VITE_APP_NAME || 'JarvisAI'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Version:</span>
                    <span className="value">{import.meta.env.VITE_APP_VERSION || '1.0.0'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">API Base:</span>
                    <span className="value">{import.meta.env.VITE_API_BASE_URL}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Mode:</span>
                    <span className="value">{import.meta.env.MODE}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
