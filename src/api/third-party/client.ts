import axios from "axios";

export const thirdPartyClient = axios.create({
  headers: { "Content-Type": "application/json" },
});
