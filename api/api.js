import Constants from 'expo-constants';

const handleHttpRequest = async (url, method, body, customHeaders = {}) => {

    try {
        const baseUrl = Constants.expoConfig.extra.apiUrl;

        if (!baseUrl) {
            return { success: false, error: 'API endpoint URL is not configured.' };
        }

        // Auth token handling - uncomment when implementing authentication
        // const token = await AsyncStorage.getItem('token');
        
        const options = {
            method,
            headers: customHeaders
            // ...(token && { 'Authorization': `Bearer ${token}` })
        };
    
        if (method !== 'GET' && body) {
            options.body = body;
        }

        const response = await fetch(`${baseUrl}${url}`, options);

        let responseData;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        if (response.ok) {
            return { success: true, data: responseData, status: response.status };
        } else {
            // Include error data from server 
            return { success: false, error: responseData.message || 'Request failed', status: response.status, data: responseData};
        }
    } catch (error) {
        console.error('Network request failed:', error);

        return { success: false, error: error?.message || 'Network error', isNetworkError: true };
    }
};

export default handleHttpRequest;