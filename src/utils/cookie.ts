import { getDomain } from "tldts";

const hostname = getDomain(location.hostname);
const domain = hostname ? `.${hostname}` : "localhost";

export const delCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${domain}; path=/;`;
};

export const getCookie = (name: string): string => {
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  name = `${name}=`;

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];

    while (c.charAt(0) == " ") c = c.substring(1);

    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }

  return "";
};

export const setCookie = (name: string, value: string) => {
  const d = new Date();

  d.setTime(d.getTime() + 10 * 24 * 60 * 60 * 1000);

  const expires = "expires=" + d.toUTCString();

  document.cookie = `${name}=${value}; ${expires}; domain=${domain}; path=/`;
};
