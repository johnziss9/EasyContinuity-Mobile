import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

const useFileBrowser = () => {
    const [filesInfo, setFilesInfo] = useState([]);

    const browseFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true
            });
            console.log('Document Picker Result:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const files = Array.isArray(result.assets) ? result.assets : [result];
                setFilesInfo(files);
                console.log(`Selected ${files.length} file(s)`);
                files.forEach((file, index) => {
                    console.log(`File ${index + 1}: ${file.name} (${file.size} bytes)`);
                });

                // TODO: Add code to upload documents

                return files;
            } else {
                console.log('Document picking cancelled or failed');
                return null;
            }
        } catch (err) {
            console.error('Error picking document:', err);
            return null;
        }
    };

    return {
        filesInfo,
        browseFiles,
    };
};

export default useFileBrowser;