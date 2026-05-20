// This file is responsible for creating an instance of the Axios HTTP client with a predefined base URL.

import axios from "axios";
import { API_BASE } from "../constants/config";

const api = axios.create({
  baseURL: API_BASE,
});

export default api;
