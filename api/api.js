import Constants from 'expo-constants';

const handleHttpRequest = async (url, method, body) => {

    try {
        const baseUrl = Constants.expoConfig.extra.apiUrl;

        if (!baseUrl) {
            return { success: false, error: 'API endpoint URL is not configured.' };
        }

        // Auth token handling - uncomment when implementing authentication
        // const token = await AsyncStorage.getItem('token');
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                // ...(token && { 'Authorization': `Bearer ${token}` }) // Uncomment when implementing auth
            }
        };
    
        if (method !== 'GET' && body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${baseUrl}${url}`, options);
        const data = await response.json();

        if (response.ok) {
            return { success: true, data, status: response.status };
        } else {
            // Include error data from server 
            return { success: false, error: data.message || 'Request failed', status: response.status, data};
        }
    } catch (error) {
        console.error('Request failed:', { url, method, error: error?.message });
        
        return { success: false, error: error?.message || 'Network error', isNetworkError: true };
    }
};

export default handleHttpRequest;