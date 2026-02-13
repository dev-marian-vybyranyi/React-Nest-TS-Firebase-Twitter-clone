import axios from "axios";

const BASE_URL = "http://127.0.0.1:5001/twitter-clone-6fb62/us-central1/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
