import {Button, Icon} from 'antd'
import React from 'react'

export default ({icon, iconSize, message, expiredDate, onClick}) => {
    return (
        <Button style={{width: '100%', height: '100%', margin: '.5em 0'}} onClick={onClick}>
            <div>
                <div className={'flex-horizontal'} style={{padding: '0.25em 0em', fontSize: '.9em'}}>
                    <div className={'flex-horizontal'}>
                        <img alt="payment item" src={icon} width={iconSize || 35} className={'m-r-10'}/>
                        <span style={{fontWeight: '500'}}>{message}</span>
                    </div>
                    <div className={'flex-horizontal'}>
                        <span style={{fontSize: '.9em', fontWeight: '500', color: '#6f7f8c'}}>{expiredDate}</span>
                        <Icon type={'double-right'} style={{fontSize: '1.3em', color: '#0070ba'}} className={'m-l-15'}/>
                    </div>
                </div>
            </div>
        </Button>
    )
}
