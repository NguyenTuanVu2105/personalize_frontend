export const getTitleFromFileName = (fileName) => {
    return fileName.replace(/\.[^/.]+$/, '')
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s*/, ' ').trim()// Replace Non Work characters
}
