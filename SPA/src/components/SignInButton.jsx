import { useMsal } from "@azure/msal-react";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import { loginRequest } from "../config/authConfig";

export const SignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = async (loginType) => {
        if (loginType === "popup") {
            try {
                const response = await instance.loginPopup({
                    scopes: loginRequest.scopes,
                    redirectUri: import.meta.env.VITE_POPUP_REDIRECT_URI,
                });
                console.log("Microsoft popup sign-in successful", response);
                if (response.account) {
                    instance.setActiveAccount(response.account);
                }
            } catch (error) {
                console.error("Microsoft popup sign-in failed", error);
            }
        } else if (loginType === "redirect") {
            instance.loginRedirect(loginRequest).catch(error => {
                console.error("Microsoft redirect sign-in failed", error);
            });
        }
    };

    return (
        <DropdownButton variant="dark" className="auth-menu" drop="start" title="Sign in">
            <Dropdown.Item as="button" onClick={() => handleLogin("popup")}>Sign in using Popup</Dropdown.Item>
            <Dropdown.Item as="button" onClick={() => handleLogin("redirect")}>Sign in using Redirect</Dropdown.Item>
        </DropdownButton>
    );
};