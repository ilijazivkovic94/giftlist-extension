import { useEffect, useState } from 'react';
import {
  LoginSocialGoogle,
  LoginSocialFacebook,
} from 'reactjs-social-login';
import Header from '../components/Header';
import { ERROR_ICON, EYE } from "../constant";
import { useProductContext } from '../contexts/ProductContext';
import { instance } from '../store/api';

const Login = () => {
  const [context] = useProductContext();
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [errMessage, setErrorMessage] = useState('');

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e) => {
    setErrorMessage('');
    setLoginInfo({ ...loginInfo, email: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setErrorMessage('');
    setLoginInfo({ ...loginInfo, password: e.target.value });
  }

  const handleSignin = () => {
    setLoading(!isLoading);
    instance
      .post('/user/signin', loginInfo)
      .then(res => {
        setLoading(false);
        if (res.status === 200) {
          localStorage.setItem('@access_token', res.token);
          localStorage.setItem('@refresh_token', res.refresh_token);
          localStorage.setItem('@user', JSON.stringify(res.data));
          instance.defaults.headers.common['x-access-token'] = res.token;
          window.location.reload();
        } else {
          if (res.message) {
            setErrorMessage(res.message);
          }
        }
      })
      .catch(err => {
        setLoading(false);
        setErrorMessage(err);
      })
  };

  const handleForgotPassword = () => {
    window.parent.postMessage({ type: 'open', link: 'https://www.giftlist.com/forgot-password' }, '*');
  }

  const handleSignup = () => {
    window.parent.postMessage({ type: 'open', link: 'https://www.giftlist.com/sign-up' }, '*');
  }

  const onLoginStart = () => {
    console.log('start');
  }

  const onLogoutSuccess = () => {
    console.log('logout');
  }

  useEffect(() => {
    window.parent.postMessage({ type: 'resize-modal', width: '465px', height: '525px' }, "*");
  }, []);

  return (
    <div className="App" id="giftlist_extension_popup_container">
      <div id="giftlist_extension_popup_content">
        <Header isAuthenticated={context.isAuthencated} />
        <div className="giftlist-extension-login-content">
          <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
            <div style={{ display: 'flex', flex: 1 }} id="google_login_btn">
              <LoginSocialGoogle
                client_id={'192788379011-3uf0ii69k0igf4uj5hvdla853jhmlo4r.apps.googleusercontent.com'}
                onLoginStart={onLoginStart}
                redirect_uri={'https://giftlist-31067.firebaseapp.com/__/auth/handler'}
                scope="openid profile email"
                discoveryDocs="claims_supported"
                access_type="offline"
                onResolve={({ provider, data }) => {
                  console.log(data);
                }}
                onReject={err => {
                  console.log(err);
                }}
              >
                <img src="/images/login_with_google.svg" style={{ width: '100%' }} alt={''} />
              </LoginSocialGoogle>
            </div>
            <div style={{ display: 'flex', flex: 1 }} id="facebook_login_btn">
              <LoginSocialFacebook
                appId={'686337189167901'}
                fieldsProfile={
                  'id,first_name,last_name,middle_name,name,name_format,picture,short_name,email,gender'
                }
                onLoginStart={onLoginStart}
                onLogoutSuccess={onLogoutSuccess}
                redirect_uri={'https://giftlist-31067.firebaseapp.com/__/auth/handler'}
                onResolve={({ provider, data }) => {
                  console.log(data);
                }}
                onReject={err => {
                  console.log(err);
                }}
              >
                <img src="/images/login_with_facebook.svg" style={{ width: '100%' }} alt={''} />
              </LoginSocialFacebook>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', flex: 1, height: 1, backgroundColor: 'rgba(0, 9, 31, 0.08)' }}>
            </div>
            <span style={{ fontWeight: 'bold' }}> OR </span>
            <div style={{ display: 'flex', flex: 1, height: 1, backgroundColor: 'rgba(0, 9, 31, 0.08)' }}>
            </div>
          </div>
          <div className="extension-form-group">
            <label>Your email</label>
            <input type="text" placeholder="Enter your email" id="giftlist-extension-login-email" autoComplete="on" value={loginInfo.email} onChange={handleEmailChange} />
          </div>
          <div className="extension-form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input type={showPassword ? "text" : "password"} placeholder="Enter password" id="giftlist-extension-login-input" style={{ paddingRight: 20 }} autoComplete="on" value={loginInfo.password} onChange={handlePasswordChange} />
            <div style={{ position: 'absolute', right: 12, bottom: 6, zIndex: 2 }} id="show_password_btn" onClick={handleShowPassword}>
              <img src={EYE} style={{ width: 18, height: 18 }} alt={''} />
            </div>
          </div>
          {errMessage &&
            <div className="extension-error-container" style={{ position: 'relative', height: 60 }}>
              <div style={{ 'position': 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', top: 3 }}>
                <div id="giftlist_extension_add_gift_error_message" style={{ width: '100%' }}>
                  <div id="giftlist_extension_add_gift_error_message_icon" style={{ display: 'flex' }}>
                    <img src={ERROR_ICON} style={{ width: 25, height: 25 }} alt={''} />
                  </div>
                  <div id="giftlist_extension_add_gift_error_title" style={{ fontSize: 12, background: '#FF574D' }}>
                    {errMessage}
                  </div>
                </div>
              </div>
            </div>
          }
          <div className="form-actions" style={{ marginTop: 24 }}>
            <button className="extension-btn" id="giftlist_sign_in" disabled={!loginInfo.email || !loginInfo.password || isLoading} onClick={handleSignin}>
              {isLoading &&
                <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
              }
              Sign in
            </button>
            <a href="#" rel="noreferrer" onClick={handleForgotPassword} style={{ paddingTop: 15, paddingBottom: 20, fontWeight: 500, fontSize: 15, lineHeight: '20px' }}>Forgot password?</a>
            <span style={{ fontSize: 13, lineHeight: '16px' }}>New to GiftList? <a href="#" style={{ fontWeight: 'bold' }} rel="noreferrer" onClick={handleSignup}>Sign up</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;