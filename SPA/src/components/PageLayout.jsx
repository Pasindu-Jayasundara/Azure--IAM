import Navbar from 'react-bootstrap/Navbar';

import { useIsAuthenticated } from '@azure/msal-react';
import { SignOutButton } from './SignOutButton';

/**
 * Renders the navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated
 * @param props
 */
export const PageLayout = (props) => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <>
            <Navbar className="app-navbar">
                <a className="brand" href="/">
                    <span className="brand-mark">AI</span>
                    <span>Azure / IAM</span>
                </a>
                <div className="nav-actions">
                    {isAuthenticated && <SignOutButton />}
                </div>
            </Navbar>
            {props.children}
        </>
    );
};
