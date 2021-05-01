import {Button, Popover, OptionList} from "@shopify/polaris"
import React, {useState, useCallback, useEffect} from "react"

const TextTypeFaceSelector = ({typeFace, onChangeTextTypeFace, listFonts}) => {
    const [active, setActive] = useState(false);
    const [currentTypeFace, setCurrentTypeFace] = useState([typeFace.id])

    const toggleActive = useCallback(() => setActive((active) => !active), []);


    useEffect(()=> {
        setCurrentTypeFace([typeFace.id])
    }, [typeFace])

    const handleSelectedTypeFace = (value) => {
        onChangeTextTypeFace(value[0])
        setActive(!active)
    }

    const activator = (
        <Button
            fullWidth={true}
            disclosure="down"
            textAlign="left"
            size={"slim"}
            onClick={toggleActive}
        >
            <span style={{fontFamily: `"${typeFace.title}"`, wordBreak: "break-all"}}>{typeFace.title}</span>
        </Button>
    )

    const list = listFonts.map((font) => ({
        title: font.title,
        id: font.id
    }))

    return (
        <div>
            <Popover active={active} activator={activator} onClose={toggleActive} fullWidth={true}>
                <OptionList
                    // title="Inventory Location"
                    onChange={handleSelectedTypeFace}
                    options={list.map(type => {
                        return {
                            value: type.id,
                            label: (<span style={{fontFamily: `"${type.title}"`, wordBreak: "break-all"}}>{type.title}</span>),
                        }
                    })}
                    selected={currentTypeFace}
                />
            </Popover>
        </div>
    );
}
export default TextTypeFaceSelector
