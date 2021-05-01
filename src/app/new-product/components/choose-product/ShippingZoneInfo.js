import React from 'react'
import './ShippingZoneInfo.css'
import {Tooltip} from 'antd'
import {ShippingZoneConfig} from "../../constants/shippingZoneConfig"


const ShippingZoneInfo = ({shippingZones, iconSize = 16}) => {
    const allZones = shippingZones.reduce((all, zoneInfo) => {
        return all.concat(zoneInfo.zones)
    }, [])

    return (<span className="flex-middle">
    {
        allZones.filter(zone => ShippingZoneConfig[zone]).map(zone => {
                return (
                    <Tooltip title={ShippingZoneConfig[zone].tooltip} key={zone}>
                        &nbsp;&nbsp;<img src={ShippingZoneConfig[zone].icon} alt={ShippingZoneConfig[zone].tooltip}
                                         style={{width: iconSize, height: iconSize, marginBottom: "3px"}}/>
                    </Tooltip>
                )
            }
        )
    }
    </span>)
}

export default ShippingZoneInfo
