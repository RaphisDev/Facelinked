import {manipulateAsync} from "expo-image-manipulator";

async function compressImage(uri, maxSizeMB = 1) {
    let compress = 0.9;
    let compressedImage = await manipulateAsync(uri, [], { compress, format: 'jpeg' });

    // Check the file size and adjust the compression rate if necessary
    while (compressedImage.size > maxSizeMB * 1024 * 1024 && compress > 0.1) {
        compress -= 0.1;
        compressedImage = await manipulateAsync(uri, [], { compress, format: 'jpeg' });
    }

    return compressedImage;
}