import React, {useState, useCallback, useEffect} from "react";
import {Popover, Button} from "@shopify/polaris";
import {TEXT_COLORS} from "../../../../constants/constants";
import './TextColorSelector.scss'
import {Tag} from 'antd'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import Color from "color";


const TextColorSelector = ({sideArtworkTextColor, changeTextColor}) => {

    const [active, setActive] = useState(false);
    const [selectColor, setSelectColor] = useState(sideArtworkTextColor)
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const onChangeTextColor = (value) => {
        setSelectColor(value)
        changeTextColor(value)
        setActive((active) => !active)
    }

    const activator = (
        <Button onClick={toggleActive} disclosure="select" fullWidth={true}
                size={"slim"}>
            <div
                style={{
                    width: "80%",
                    backgroundColor: selectColor,
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    borderRadius: 5
                }}
            />
        </Button>
    );

    useEffect(() => {
        setSelectColor(sideArtworkTextColor)
    }, [sideArtworkTextColor])
    const textColor = (
        <div style={{padding: 10}}>
            <div style={{fontSize: "14px", textAlign: "left", fontWeight: "1000"}}>Text color</div>
            <div className="text-color-selection" style={{height: "220px"}}>
                {
                    TEXT_COLORS.map((color, index) => {
                        return (
                            <Tag
                                key={index}
                                color={color.value}
                                className="text-color mr-0"
                                onClick={() => onChangeTextColor(color.value)}
                            >
                                {
                                    selectColor === color.value
                                    && <FontAwesomeIcon
                                        style={{fontSize: "11px"}}
                                        icon={faCheck}
                                        color={Color(color.value.toLowerCase()).hsl().color[2] > 90 ? '#8e8e8e' : '#ffffff'}
                                    />
                                }
                            </Tag>
                        )

                    })
                }
            </div>
        </div>

    )

    return (
        <Popover
            active={active}
            activator={activator}
            onClose={toggleActive}
            fluidContent={true}
            children={textColor}
            fullWidth={true}
        />
    )
}
export default TextColorSelector
