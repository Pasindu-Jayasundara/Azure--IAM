import { useMsal } from "@azure/msal-react";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import { loginRequest } from "../config/authConfig";

/**
 * Renders a drop down button with child buttons for logging in with a popup or redirect
 */
export const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = async (loginType) => {
        if (loginType === "popup") {
            try {
                const response = await instance.loginPopup({
                    scopes: loginRequest.scopes,
                    redirectUri: import.meta.env.VITE_POPUP_REDIRECT_URI,
                });
                if (response.account) {
                    console.log("Popup sign-in successful", response.account);
                    instance.setActiveAccount(response.account);
                }
            } catch (e) {
                console.error("Popup sign-in failed", e);
            }
        } else if (loginType === "redirect") {
            instance.loginRedirect(loginRequest).catch(e => {
                console.error("Redirect sign-in failed", e);
            });
        }
    }
    return (
        <DropdownButton variant="secondary" className="ml-auto" drop="start" title="Sign In">
            <Dropdown.Item as="button" onClick={() => handleLogin("popup")}>Sign in using Popup</Dropdown.Item>
            <Dropdown.Item as="button" onClick={() => handleLogin("redirect")}>Sign in using Redirect</Dropdown.Item>
        </DropdownButton>
    )
}