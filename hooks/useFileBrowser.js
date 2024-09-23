import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

const useFileBrowser = (options = {}) => {
    const [filesInfo, setFilesInfo] = useState([]);

    const browseFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: options.fileTypes || '*/*',
                multiple: true
            });
            console.log('Document Picker Result:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                let files = result.assets;
                
                // Apply file type filter if specified
                if (options.fileTypes) {
                    files = files.filter(file => 
                        options.fileTypes.some(type => file.mimeType.startsWith(type))
                    );
                }

                if (files.length > 0) {
                    setFilesInfo(prevFiles => [...prevFiles, ...files]);
                    console.log(`Selected ${files.length} file(s)`);
                    files.forEach((file, index) => {
                        console.log(`File ${index + 1}: ${file.name} (${file.size} bytes)`);
                    });

                    // TODO: Add code to upload documents

                    return files;
                } else {
                    console.log('No valid files selected');
                    return null;
                }
            } else {
                console.log('Document picking cancelled or failed');
                return null;
            }
        } catch (err) {
            console.error('Error picking document:', err);
            return null;
        }
    };

    const clearFiles = () => {
        setFilesInfo([]);
    };

    return {
        filesInfo,
        browseFiles,
        clearFiles,
    };
};

export default useFileBrowser;