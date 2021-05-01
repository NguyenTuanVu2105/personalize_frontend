export const getProductAdminInShopUrl = (shop_url, product_id) => {
    return `${shop_url.includes('http') ? '' : 'https://'}${shop_url}/admin/products/${product_id}`
}

export const getProductPreviewInShopUrl = (shop_url, product_id) => {
    return `${shop_url.includes('http') ? '' : 'https://'}${shop_url}/products/${product_id}`
}