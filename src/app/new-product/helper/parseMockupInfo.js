export const parseMockupInfo = (mockupInfo) => {
    return {
        frameCenterX: mockupInfo.frame_x,
        frameCenterY: mockupInfo.frame_y,
        frameWidth: mockupInfo.frame_width,
        frameHeight: mockupInfo.frame_height,
        imageWidth: mockupInfo.image_width,
        imageHeight: mockupInfo.image_height,
        imagePath: mockupInfo.image_path,
        type: mockupInfo.type
    }
}


