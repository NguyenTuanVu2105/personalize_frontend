import React from 'react'
import {Spin} from 'antd'

export default () => {
    return (
        <div className={'overlay'}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                <Spin tip="Completing payment..." size={'large'}/>
            </div>
        </div>
    )
}
