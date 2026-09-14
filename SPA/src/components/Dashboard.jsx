import { useMsal } from "@azure/msal-react";

function Dashboard() {
    const { accounts } = useMsal();
    const activeAccount = accounts[0];

    // Read the secure token payload claims sent back from Azure Identity Platform
    const userRoles = activeAccount?.idTokenClaims?.roles || [];
    
    // Evaluate application permissions locally
    const isAdmin = userRoles.includes("ADMIN");
    const isManager = userRoles.includes("MANAGER");

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '6px' }}>
            <h3>Welcome back, {activeAccount?.name}!</h3>
            <p><strong>Principal Name:</strong> {activeAccount?.username}</p>
            <p><strong>Identity Token Roles Claim:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'None'}</p>
            
            <hr style={{ margin: '20px 0' }} />

            {/* Manager and Admin Component Layer */}
            {(isManager || isAdmin) ? (
                <div style={{ background: '#e2f0d9', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
                    <h4>📊 Manager Operational Data Grid</h4>
                    <p>Access Granted. You have application validation permissions to review operational metrics.</p>
                </div>
            ) : (
                <p style={{ color: 'red' }}>⚠️ Access Denied: Your identity profile has no valid app role assignment.</p>
            )}

            {/* Admin Only Component Layer */}
            {isAdmin ? (
                <div style={{ background: '#fce4d6', padding: '15px', margin: '10px 0', borderRadius: '4px', border: '1px solid #f4b084' }}>
                    <h4>🛡️ System Administrative Console</h4>
                    <p>Elevated Access Level Validated.</p>
                    <button onClick={() => alert("Simulating structural cloud mutations...")} style={{ background: '#d83b01', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>
                        Flush App Caches (Admin Action)
                    </button>
                </div>
            ) : (
                <div style={{ background: '#eee', padding: '15px', margin: '10px 0', borderRadius: '4px', color: '#666' }}>
                    <h4>🔒 Administrative Console (Locked)</h4>
                    <p>Requires an account possessing the <strong>Admin</strong> application claim.</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
