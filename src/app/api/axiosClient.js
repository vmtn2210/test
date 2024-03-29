import axios from 'axios';

export const baseURL = 'https://dichvuit-be.hisoft.vn/v1/itsds';


const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'content-type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    
)

axiosClient.interceptors.response.use(
    (response) => {
        return (response && response.data) || response;
    },
    (error) => {
        throw error;
    }
);

export default axiosClient;