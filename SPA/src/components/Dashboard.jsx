import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { tokenRequest } from "../config/authConfig";

function Dashboard() {
  const { accounts, instance } = useMsal();
  const activeAccount = accounts[0];
  const [requestState, setRequestState] = useState({});

  // Read the secure token payload claims sent back from Azure Identity Platform
  const userRoles = activeAccount?.idTokenClaims?.roles || [];

  const handleBackendRequest = async (requestKey, endpoint) => {
    setRequestState((currentState) => ({
      ...currentState,
      [requestKey]: { status: "loading", result: null },
    }));

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...tokenRequest,
        account: activeAccount,
      });
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The backend request was not successful.",
        );
      }

      setRequestState((currentState) => ({
        ...currentState,
        [requestKey]: { status: "success", result },
      }));
    } catch (error) {
      console.error("Backend request failed", error);
      setRequestState((currentState) => ({
        ...currentState,
        [requestKey]: { status: "error", result: { error: error.message } },
      }));
    }
  };

  const renderRequestCard = (requestKey, role, endpoint) => {
    const request = requestState[requestKey];

    return (
      <article className="request-card" key={requestKey}>
        <span className="card-label">{role} ENDPOINT</span>
        <h2>{endpoint}</h2>
        <p>This request requires the {role} role.</p>
        <button
          className="request-button"
          onClick={() => handleBackendRequest(requestKey, endpoint)}
          disabled={request?.status === "loading"}
        >
          {request?.status === "loading" ? "Requesting..." : "Send request"}
          <span aria-hidden="true">-&gt;</span>
        </button>
        {request?.result && (
          <pre className={`request-result ${request.status}`}>
            {JSON.stringify(request.result, null, 2)}
          </pre>
        )}
      </article>
    );
  };

  return (
    <main className="dashboard">
      <section className="dashboard-heading">
        <div>
          <span className="eyebrow">ACCOUNT OVERVIEW</span>
          <h1>Welcome back, {activeAccount?.name || "there"}.</h1>
          <p className="dashboard-intro">
            Your verified identity and workspace access, in one place.
          </p>
        </div>
        <span className="status-pill">
          <span />
          Authenticated
        </span>
      </section>
      <section className="identity-grid">
        <div className="identity-card">
          <span className="card-label">IDENTITY DETAILS</span>
          <div className="detail-row">
            <span>Name</span>
            <strong>{activeAccount?.name || "Not available"}</strong>
          </div>
          <div className="detail-row">
            <span>Username</span>
            <strong>{activeAccount?.username || "Not available"}</strong>
          </div>
          <div className="detail-row">
            <span>Role</span>
            <strong>
              {userRoles.length > 0 ? userRoles.join(", ") : "No role assigned"}
            </strong>
          </div>
        </div>
        <div className="placeholder-card">
          <span className="card-label">NEXT IN THE WORKSPACE</span>
          <h2>More functionality will live here.</h2>
          <p>This space is reserved for future workspace features.</p>
        </div>
      </section>
      <section className="request-section">
        <span className="eyebrow">ROLE-PROTECTED ENDPOINTS</span>
        <h2>Backend requests</h2>
        <p className="request-section-copy">
          Each request is checked by the backend against the role in your access token.
        </p>
        <div className="request-grid">
          {renderRequestCard("admin", "ADMIN", "/api/admin-data")}
          {renderRequestCard("manager", "MANAGER", "/api/manager-data")}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
