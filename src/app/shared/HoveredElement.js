import React, {useState} from 'react'
import PropTypes from 'prop-types'

const HoveredElement = ({className, hoveredElement, style, unHoveredElement, onClick, id}) => {
    const [hover, setHover] = useState(false)
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            {...{
                className,
                onClick,
                style,
                id
            }}
        >
            {hover ? hoveredElement : unHoveredElement}
        </div>
    )
}

HoveredElement.defaultProps = {
    hoveredElement: <div/>,
    unHoveredElement: <div/>,
}

HoveredElement.propTypes = {
    hoveredElement: PropTypes.node,
    unHoveredElement: PropTypes.node,
}

export default HoveredElement
