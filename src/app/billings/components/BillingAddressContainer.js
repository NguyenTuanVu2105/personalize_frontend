import React from 'react'
import {Card} from '@shopify/polaris'

const UserInfoItem = ({label, value, textBold = false}) => {
    if (!value) {
        return null
    }
    return <div className={'flex-horizontal'} style={{marginBottom: '.5em', ...(textBold ? {fontWeight: '500'} : null)}}>
        <div>
            <p style={{color: '#454F5B', marginBottom: 0}}>{label}:</p>
        </div>
        <div>
            <p style={{marginBottom: 0}}>{value}</p>
        </div>
    </div>
}

export default ({customerInfo}) => {
    const {email, name, address} = customerInfo
    return (
        <Card.Section title={'Billing Address'}>
            <div className={'m-t-15'}>
                <UserInfoItem label={'Full name'} value={name} textBold={true}/>
                <UserInfoItem label={'Email'} value={email}/>
                {/*<UserInfoItem label={"Phone"} value={"+84964518919"}/>*/}
                <UserInfoItem label={'Address'} value={address}/>
            </div>
        </Card.Section>
    )
}
