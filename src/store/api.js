import axios from "axios";

let defaultAccessToken = "";
const defaultRefreshToken = "babdc6ef-3a19-49f7-87d0-6964c77729fd2t5MyADrFXtGciHlU76Dcs";

const accessTokenValue = localStorage.getItem('@access_token') || defaultAccessToken;

export let instance = axios.create({
  baseURL: `https://admin.giftlist.com/api`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    'Content-Type': "application/json",
    'x-access-token': accessTokenValue,
    'Access-Control-Allow-Origin': "*",
  },
});

export const checkToken = () => {
  const currentToken = localStorage.getItem('@access_token');
  instance.defaults.headers.common['x-access-token'] = currentToken;
  return instance
    .post("/token/check")
    .then(async (res) => {
      if (res.status !== 200) {
        return null;
      } else {
        return currentToken;
      }
    });
}

export const refreshToken = () => {
  const currentRefreshToken = localStorage.getItem("@refresh_token") || defaultRefreshToken;
  if (!currentRefreshToken) {
    return;
  }
  const postData = {
    refresh_token: currentRefreshToken,
  };
  return instance
    .post("/user/refresh/token", postData)
    .then((res) => {
      localStorage.setItem("@access_token", res.token);
      instance.defaults.headers.common['x-access-token'] = res.token;
      localStorage.setItem("@refresh_token", currentRefreshToken);
      return res;
    });
};

instance.interceptors.response.use(async (response) => {
  return response.data;
}, error => {
  const status = error.response ? error.response.status : null
  const currentRefreshToken = localStorage.getItem("@refresh_token") || defaultRefreshToken;

  if (status === 401 && !error.config._retry && currentRefreshToken) {
    return refreshToken().then(data => {
      defaultAccessToken = data.token;
      return instance({
        ...error.config,
        headers: {
          Accept: "application/json",
          'Content-Type': "application/json",
          'Access-Control-Allow-Origin': "*",
          'x-access-token': defaultAccessToken
        },
      });
    });
  }
  return Promise.reject(error);
});

export const setToken = (token) => {
  instance = axios.create({
    baseURL: `https://admin.giftlist.com/api`,
    withCredentials: false,
    headers: {
      Accept: "application/json",
      'Content-Type': "application/json",
      'x-access-token': token,
      'Access-Control-Allow-Origin': "*",
    },
  });
  instance.interceptors.response.use(async (response) => {
    return response.data;
  }, error => {
    const status = error.response ? error.response.status : null
    const currentRefreshToken = localStorage.getItem("@refresh_token") || defaultRefreshToken;
    if (status === 401 && !error.config._retry && currentRefreshToken) {
      return refreshToken().then(data => {
        defaultAccessToken = data.token;
        return instance({
          ...error.config,
          headers: {
            Accept: "application/json",
            'Content-Type': "application/json",
            'Access-Control-Allow-Origin': "*",
            'x-access-token': defaultAccessToken
          },
        });
      });
    }
    return Promise.reject(error);
  });
  return instance;
}
