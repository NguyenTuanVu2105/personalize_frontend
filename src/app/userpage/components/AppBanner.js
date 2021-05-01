import React, {useContext, useEffect} from "react"
import {Carousel, Layout} from "antd"
import "./Banner.scss"
import AppContext from "../../../AppContext"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes} from "@fortawesome/free-solid-svg-icons"

const {Header} = Layout

const CAROUSEL_SPEED = 3000

const AppBanner = () => {
    const {hasBanner, closeBanner, bannerContent} = useContext(AppContext)

    useEffect(() => {
        updateFrame()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bannerContent])

    const updateFrame = () => {
        bannerContent.forEach((content, index) => {
            const frames = document.querySelectorAll(`.frame-${index}`)
            frames.forEach(frame => {
                const frameDocument = frame.contentDocument
                if (frameDocument) {
                    const body = frameDocument.body
                    body.style.overflow = "hidden"
                    body.style.margin = 0
                    body.innerHTML = content.header_html
                }
            })
        })
    }

    return (
        <Header id="banner" className={`app-banner ${hasBanner ? "has-banner" : ""}`}>
            <div style={{height: "100%", position: "relative"}}>
                <Carousel dots={false} autoplaySpeed={CAROUSEL_SPEED} autoplay={true} className="banner-carousel">
                    {
                        bannerContent.map((content, index) => {
                            const iframe = <iframe title={content.name} className={`frame-${index} banner-iframe`}
                                                   />
                            return (
                                <div key={index}>
                                    {iframe}
                                </div>
                            )
                        })
                    }
                </Carousel>
                <div className="close-banner-container">
                    <FontAwesomeIcon
                        onClick={closeBanner}
                        style={{fontSize:"1.5em"}}
                        icon={faTimes}
                        className="close-banner"
                    />
                </div>
            </div>
        </Header>
    )
}

export default AppBanner