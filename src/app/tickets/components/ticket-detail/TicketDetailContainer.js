import React, {useContext, useEffect } from "react"
import DocTitle from "../../../shared/DocTitle"
import TicketDetail from "./TicketDetail"
import UserPageContext from "../../../userpage/context/UserPageContext"
import Paths from "../../../../routes/Paths"

const TicketDetailContainer = (props) =>{

    const id = parseInt(props.match.params.id)
    const {setNameMap, setViewWidth, setDefaultViewWidth} = useContext(UserPageContext)

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [Paths.Support]: 'Support',
            [Paths.TicketDetail(id)]: id,
        })
        setViewWidth(100)
        return () => {
            setDefaultViewWidth()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div>
            <DocTitle title={`#${id} | Ticket Detail`}/>
            <div>
                <TicketDetail id={id}  />
            </div>
        </div>
    )
}

export default TicketDetailContainer