export const calculateShippingTimeRange= async (productAllInfo) => {
    let result = productAllInfo;
    try{
        if(productAllInfo.length>0){
            productAllInfo.forEach(function (currentProduct,index){
                let shippingTimeRange= {
                    "min":999,
                    "max":0
                }
                let processingTimeRange= {
                    "min":999,
                    "max":0
                }
                let productShippingZoneData = currentProduct.meta.shipping_meta.shipping_zones
                if(productShippingZoneData.length>0){
                    productShippingZoneData.forEach(function(shippingZoneData){
                        if(shippingTimeRange.min>shippingZoneData.delivery_info.shipping_time.min){
                            shippingTimeRange.min = shippingZoneData.delivery_info.shipping_time.min
                        }
                        if(shippingTimeRange.max < shippingZoneData.delivery_info.shipping_time.max){
                            shippingTimeRange.max = shippingZoneData.delivery_info.shipping_time.max
                        }

                        if(processingTimeRange.min>shippingZoneData.delivery_info.processing_time.min){
                            processingTimeRange.min = shippingZoneData.delivery_info.processing_time.min
                        }
                        if(processingTimeRange.max < shippingZoneData.delivery_info.processing_time.max){
                            processingTimeRange.max = shippingZoneData.delivery_info.processing_time.max
                        }
                    })
                }
                productAllInfo[index].meta.shipping_meta['shipping_range'] = shippingTimeRange.min +' - '+shippingTimeRange.max+' business days'
                productAllInfo[index].meta.shipping_meta['progressing_range'] = processingTimeRange.min +' - '+processingTimeRange.max+' business days'
            });

        }
    }catch (e){
        console.log(e);
        return result;
    }
    return productAllInfo;
}