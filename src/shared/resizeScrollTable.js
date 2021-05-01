
// width paragraph divided into 3 lines
export const WidthResponsiveDashboardTimeSelector = 907

// width responsive lg in antd grid
export const WidthResponsiveBestSelling = 992

export const WidthResponsiveNavBar = 1100

export const getScrollTable = () => {
    const width = window.innerWidth
    if (width > WidthResponsiveNavBar){
        return {}
    } else{
        return {
            scroll: {
                x: WidthResponsiveNavBar
            }
        }
    }

}