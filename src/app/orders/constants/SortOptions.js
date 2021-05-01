export const SORT_OPTIONS = [
    {
        label: 'Order number (ascending)',
        value: 'order_number'
    },
    {
        label: 'Order number (descending)',
        value: '-order_number'
    },
    {
        label: 'Create Date (oldest first)',
        value: 'create_time'
    },
    {
        label: 'Create Date (newest first)',
        value: '-create_time'
    },
    {
        label: 'Update Date (oldest first)',
        value: 'update_time'
    },
    {
        label: 'Update Date (newest first)',
        value: '-update_time'
    },
    {
        label: 'Customer name (A-Z)',
        value: 'customer_info__first_name'
    },
    {
        label: 'Customer name (Z-A)',
        value: '-customer_info__first_name'
    },
    // {
    //     label: 'Payment status (A-Z)',
    //     value: '-financial_status'
    // },
    // {
    //     label: 'Payment status (Z-A)',
    //     value: 'financial_status'
    // },
    // {
    //     label: 'Fulfillment status (A-Z)',
    //     value: 'fulfill_status'
    // },
    // {
    //     label: 'Fulfillment status (Z-A)',
    //     value: '-fulfill_status'
    // },
    {
        label: 'Total cost (low to high)',
        value: 'total_cost'
    },
    {
        label: 'Total cost (high to low)',
        value: '-total_cost'
    },
]