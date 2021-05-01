import {Tooltip} from '@shopify/polaris'
import React from 'react'
import Paths from '../../../../routes/Paths'
import {Link, withRouter} from 'react-router-dom'

import "./StepFooter.scss"
import logo from "../../../../assets/presentations/logo.png"

const StepFooter = (props) => {
    return (
        <div className="step-footer row no-gutters">
            <div className="col-6 flex-start text-center">
                <Tooltip content={"Go to Dashboard"}>
                    <Link to={Paths.Dashboard}>
                        <img src={logo} alt="PrintHolo" height={'22px'}/>
                    </Link>
                </Tooltip>
            </div>
            {/*<div className="col-7 flex-end">*/}
            {/*<div className={"text-right"}>*/}
            {/*<FontAwesomeIcon icon={faCopyright} style={{fontSize: "14px"}}/>&nbsp;*/}
            {/*All right reserved*/}
            {/*</div>*/}
            {/*</div>*/}
        </div>
    )
}

export default withRouter(StepFooter)
