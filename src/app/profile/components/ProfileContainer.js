import React, {useContext, useEffect, useState} from 'react'
import UserPageContext from '../../userpage/context/UserPageContext'
import BasicInfo from './BasicInfo'
import ChangePassword from './ChangePassword'
import {getUserProfile} from '../../../services/api/userProfile'
import {DisplayText, Frame, Loading, TextContainer} from '@shopify/polaris'
import "./ProfileContainer.scss"
import {Modal} from 'antd'
import Paths from "../../../routes/Paths"

const ProfileContainer = (props) => {

    const {setNameMap} = useContext(UserPageContext)

    const {location} = props

    const [_loading, _setLoading] = useState(true)

    const [_profile, _setProfile] = useState({})

    useEffect(() => {
        setNameMap({
            [Paths.Dashboard]: 'Dashboard',
            [location.pathname]: 'Profile'
        })
        _fetchProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _fetchProfile = async () => {
        const {success, data} = await getUserProfile()
        if (success && data.success) {
            _setProfile(data.profile)
        } else {
            Modal.error({
                content: 'An error occurs. Please try again'
            })
        }
        setTimeout(() => {
            _setLoading(false)
        }, 300)
    }

    const refresh = () => {
        _fetchProfile()
    }

    return _loading ? (
        <Frame>
            <Loading/>
        </Frame>
    ) : (
        <Frame>
            <div className={'ui-title-bar--separator'} style={{display: 'flex', justifyContent: 'space-between'}}>
                <TextContainer spacing="tight">
                    <DisplayText element="h3" size="large">Profile</DisplayText>
                </TextContainer>
                {/*<div className="btn-heading">*/}
                {/*<Button primary>Save</Button>*/}
                {/*</div>*/}
            </div>
            <div className="page-main-content">
                <BasicInfo loading={_loading} profile={_profile} refresh={refresh}/>
                <ChangePassword profile={_profile}/>
            </div>
        </Frame>
    )
}

export default ProfileContainer
