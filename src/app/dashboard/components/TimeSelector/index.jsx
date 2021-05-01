import React, {useEffect, useState} from 'react'
import {DateRange} from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import {Dropdown, Icon, Menu, Popover} from 'antd'
import './TimeSelector.scss'
import {dateOptions, getDefaultDateOption} from '../../static/dateOptions'
import {Button, ButtonGroup} from '@shopify/polaris'
import {WidthResponsiveDashboardTimeSelector} from "../../../../shared/resizeScrollTable"

const TYPE = {
    ButtonGroup: 1,
    OptionList: 2
}

function TimeSelector({applyRanges, reloadFunction, isLoading, startDate}) {
    const defaultCustomRanges = {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    }
    const [customRanges, setCustomRanges] = useState(defaultCustomRanges)

    const [currentRangeOption, setCurrentRangeOption] = useState(getDefaultDateOption().rangeTitle)
    const [typeDisplay, setTypeDisplay] = useState(window.innerWidth <= WidthResponsiveDashboardTimeSelector ? TYPE.OptionList : TYPE.ButtonGroup)

    const submitRangeSelect = (startDate, endDate, rangeTitle) => {
        if (!!rangeTitle) {
            setCustomRanges(defaultCustomRanges)
        }
        setCurrentRangeOption(rangeTitle)
        applyRanges(startDate, endDate, rangeTitle)
    }

    const formatTime = (time) => {
        const t = new Date(time)
        return `${t.getDate()}/${t.getMonth() + 1}/${t.getFullYear()}`
    }

    const handleCustomRangeSelect = (ranges) => {
        const start = ranges.selection.startDate
        const end = ranges.selection.endDate
        const title = formatTime(start) + " - " + formatTime(end)
        setCustomRanges(ranges.selection)
        submitRangeSelect(ranges.selection.startDate, ranges.selection.endDate)
        setCurrentRangeOption(title)
    }

    const dateRangePicker = (
        <DateRange
            className={"shadow-box"}
            ranges={[customRanges]}
            onChange={handleCustomRangeSelect}
            maxDate={new Date()}
            minDate={new Date(startDate)}
        />
    )

    useEffect(() => {
        if (window.innerWidth <= WidthResponsiveDashboardTimeSelector) {
            setTypeDisplay(TYPE.OptionList)
        } else {
            setTypeDisplay(TYPE.ButtonGroup)
        }

        window.addEventListener("resize", () => {
            if (window.innerWidth <= WidthResponsiveDashboardTimeSelector) {
                setTypeDisplay(TYPE.OptionList)
            } else {
                setTypeDisplay(TYPE.ButtonGroup)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const currentMenuSelect = () => {
        const option = dateOptions.find(option => option.rangeTitle === currentRangeOption)
        return option ? option.rangeTitle : "Custom"
    }

    const menuTimepicker = () => {
        return (
            <Menu
                defaultSelectedKeys={currentRangeOption}
                selectedKeys={currentMenuSelect()}

            >
                {
                    dateOptions.map(option => {
                        return (
                            <Menu.Item
                                title={option.rangeTitle}
                                key={option.rangeTitle}
                                onClick={() => {
                                    submitRangeSelect(option.startDate, option.endDate, option.rangeTitle)
                                }}
                                disabled={!option.enabled}
                            >
                                {option.rangeTitle}
                            </Menu.Item>
                        )
                    })
                }
                <Menu.Item
                    title={"Custom"}
                    key={"Custom"}
                    className={"no-padding"}
                >
                    <Popover
                        overlayClassName={"no-arrow"}
                        content={dateRangePicker}
                        trigger={["click"]}
                        placement={"rightBottom"}
                    >
                        <div
                            style={{
                                width: "100%",
                                padding: "0 15px",
                                marginBottom: 4
                            }}
                        >
                            Custom
                        </div>
                    </Popover>
                </Menu.Item>
            </Menu>
        )
    }


    const display = () => {
        if (typeDisplay === TYPE.ButtonGroup) {
            return (
                <ButtonGroup segmented>
                    {
                        dateOptions.map((option, index) => {
                            return (
                                <Button
                                    pressed={option.rangeTitle === currentRangeOption}
                                    key={option.rangeTitle}
                                    onClick={() => {
                                        submitRangeSelect(option.startDate, option.endDate, option.rangeTitle)
                                    }}
                                    disabled={!option.enabled}
                                >
                                    {option.rangeTitle}
                                </Button>
                            )
                        })
                    }
                    {
                        <Dropdown overlay={dateRangePicker} placement="bottomRight" trigger={['click']}>
                            <Button
                                pressed={!currentRangeOption}
                            >Custom</Button>
                        </Dropdown>
                    }
                </ButtonGroup>)
        } else {
            return (
                <div className={"dashboard-time-selector"}>
                    <Popover
                        overlayClassName={"no-arrow popover-no-padding-top"}
                        overlayStyle={{width: 200}}
                        trigger={["click"]}
                        content={menuTimepicker()}
                    >
                        <div className={"ml-4"}>
                            <Button fullWidth disclosure>
                                {currentRangeOption}
                            </Button>
                        </div>
                    </Popover>
                </div>
            )
        }
    }


    return (
        <div className="d-flex justify-content-end mt-2 mb-3">
            <Button primary onClick={reloadFunction}>
                <Icon type="reload" spin={isLoading}/>
            </Button>
            {display()}
        </div>
    )
}

export default TimeSelector
