import { create } from "apisauce";
import { API_URL } from "../constants/GlobalConstants";

const apiClient = create({
  baseURL: API_URL,
});

export default apiClient;
