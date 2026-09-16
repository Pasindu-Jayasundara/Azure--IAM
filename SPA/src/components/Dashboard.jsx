import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { tokenRequest } from "../config/authConfig";

function Dashboard() {
  const { accounts, instance } = useMsal();
  const activeAccount = accounts[0];
  const [requestState, setRequestState] = useState({
    status: "idle",
    result: null,
  });

  // Read the secure token payload claims sent back from Azure Identity Platform
  const userRoles = activeAccount?.idTokenClaims?.roles || [];

  const handleBackendRequest = async () => {
    setRequestState({ status: "loading", result: null });

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...tokenRequest,
        account: activeAccount,
      });
      const claims = JSON.parse(atob(tokenResponse.accessToken.split(".")[1]));
      console.log("Sending access token:", claims);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/admin-data`,
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

      setRequestState({ status: "success", result });
    } catch (error) {
      console.error("Backend request failed", error);
      setRequestState({ status: "error", result: { error: error.message } });
    }
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
      <section className="request-panel">
        <div>
          <span className="card-label">BACKEND CONNECTION</span>
          <h2>Request secure data</h2>
          <p>
            Send an authenticated request to the backend and view its response
            here.
          </p>
        </div>
        <button
          className="request-button"
          onClick={handleBackendRequest}
          disabled={requestState.status === "loading"}
        >
          {requestState.status === "loading" ? "Requesting..." : "Send request"}
          <span aria-hidden="true">-&gt;</span>
        </button>
        {requestState.result && (
          <pre className={`request-result ${requestState.status}`}>
            {JSON.stringify(requestState.result, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
