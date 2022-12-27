import axios from 'axios';

const ApiService = {
  get<T>(apiUrl: string, config?: any) {
    return axios.get<T>(apiUrl, config);
  },
  post<T>(apiUrl: string, data: any, config?: any) {
    return axios.post<T>(apiUrl, data, config);
  },
  put<T>(apiUrl: string, data: any, config?: any) {
    return axios.put<T>(apiUrl, data, config);
  },
  delete<T>(apiUrl: string, config?: any) {
    return axios.delete<T>(apiUrl, config);
  },
};

export default ApiService;
