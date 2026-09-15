import { PageLayout } from './components/PageLayout';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Dashboard from './components/Dashboard';
import { SignInButton } from './components/SignInButton';

export default function App() {
    return (
        <PageLayout>
            <div className="App">
            <AuthenticatedTemplate>
                <Dashboard/>
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <main className="login-screen">
                    <section className="login-panel">
                        <span className="login-logo">AI</span>
                        <h1>Sign in</h1>
                        <p>Use your Microsoft account to continue to Azure IAM.</p>
                        <SignInButton />
                    </section>
                </main>
            </UnauthenticatedTemplate>
        </div>
        </PageLayout>
    );
}
