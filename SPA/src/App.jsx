import { PageLayout } from './components/PageLayout';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Dashboard from './components/Dashboard';

export default function App() {
    return (
        <PageLayout>
            <div className="App">
            <AuthenticatedTemplate>
                {/* <ProfileContent /> */}
                <Dashboard/>
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <h5 className="card-title">Please sign-in to see your profile information.</h5>
            </UnauthenticatedTemplate>
        </div>
        </PageLayout>
    );
}
