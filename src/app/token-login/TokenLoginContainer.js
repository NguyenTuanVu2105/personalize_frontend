import * as qs from 'query-string'
import React, {useContext, useEffect} from 'react'
import {Icon, Result} from 'antd'
import {withRouter} from 'react-router-dom'
import AppContext from '../../AppContext'
import Paths from '../../routes/Paths'
import {Base64} from '../../services/util/base64'
import {getjwtToken} from "../../services/api/tokenLogin"


const TokenLoginContainer = (props) => {
    const {setUser} = useContext(AppContext)
    const params = qs.parse(props.location.search)

    useEffect( () => {
        if (params.token) {
            handleSuccess(params.token)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSuccess = async (token) => {
        const loginToken = JSON.parse(Base64._utf8_decode(atob(token)))
        await getUserToken(loginToken)
        // console.log("okie")
        props.history.push(Paths.Dashboard)
    }
    const getUserToken = async (token) => {
        const {success, data} = await getjwtToken(token)
        //console.log(data)
        if (success) {
            if (data.token) {
                await setUser(data)
            }
        }
    }
    return (<div className="flex-center">
        <Result
            status="success"
            title="Logging in"
            subTitle="If this take more than 3 seconds, maybe there are errors occurred...."
            icon={<Icon type="loading"/>}
        />

    </div>)
}


export default withRouter(TokenLoginContainer)

