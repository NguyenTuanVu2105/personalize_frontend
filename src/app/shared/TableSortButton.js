import {Button, ChoiceList, Icon, Popover, TextStyle} from "@shopify/polaris"
import React, {useCallback, useEffect, useState} from "react"
import {SortMinor} from '@shopify/polaris-icons'

export const TableSortButton = ({default_choice, choices, onChange, params}) => {
    const [sortPopover, setSortPopover] = useState(false)
    const [sortSelected, setSortSelected] = useState(false)

    useEffect(() => {
        default_choice && setSortSelected([default_choice])
    }, [default_choice])

    const togglePopoverActive = useCallback(
        () => setSortPopover((sortPopover) => !sortPopover),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const handleSortChange = useCallback((value) => {
        setSortSelected(value)
        onChange(value, params)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params])

    return (
        <Popover
            active={sortPopover}
            activator={(
                <Button onClick={togglePopoverActive} icon={(<Icon
                    source={SortMinor}/>)}>
                    Sort
                </Button>
            )}
            preferredAlignment="right"
            onClose={togglePopoverActive}
        >
            <Popover.Section>
                <ChoiceList
                    title={(<TextStyle variation="subdued">Sort by</TextStyle>)}
                    // titleHidden
                    choices={choices}
                    selected={sortSelected || []}
                    onChange={handleSortChange}
                />
            </Popover.Section>
        </Popover>
    )
}

