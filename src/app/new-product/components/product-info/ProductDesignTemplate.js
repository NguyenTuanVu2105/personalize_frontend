import React from "react"
import {Button, Heading, Tooltip} from "@shopify/polaris"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCloudDownloadAlt, faEnvelopeOpenText, faListAlt, faPoll} from "@fortawesome/free-solid-svg-icons"
import SanitizeHTML from "../../../shared/SanitizeHTML"


const designProductInstructionSteps = [
    {
        title: "Submit files in PNG or JPEG format with at least 300 DPI",
        content: "To ensure the highest quality, we highly recommend using PNG  or JPEG format for your designs."
    },
    {
        title: "Create files in CMYK color profile",
        content: "To ensure your design looks similar when printed as it does on screen, make sure you create your print file in CMYK color profile because our AOP products that are printed using sublimation"
    },
    {
        title: "Fill the entire design space",
        content: "Make sure your image covers the entire print area to ensure maximum coverage."
    },
    {
        title: "Keep important design elements within the safe print area",
        content: "All-over print files are automatically scaled to fit all sizes, so keep all important graphics or text within the safe print area to avoid missing design elements on the finished product."
    },
    {
        title: "Check your mockups by using our Preview feature (if the product is supported)",
        content: "To review your product design before publishing them to your Shopify stores."
    },
]

const howToGetBestResult = [
    "Patterns and full-bleed images usually turn out the best.",
    "Any space that isn't covered by your design will show the white fabric.",
]

const cutAndSewDisclaimer = [
    "We can't guarantee exact placement and/or pattern alignment.",
    "It's not possible to perfectly align patterns or images from front to back.",
    "Elements outside the safe print area are not guaranteed to appear fully on the finished product.",
    "When using white graphics on cut & sew products without covering the whole print area, white outlines can appear around your designs. We suggest using design files with a transparent background or covering the whole print area with a white background."
]


const ProductDesignTemplate = ({productMeta}) => {
    return (
        <div className={'row'}>
            <div className="col-12">
                {
                    productMeta.template_meta && productMeta.template_meta.template_url &&
                    <a href={productMeta.template_meta.template_url} rel="noopener noreferrer" target={'_blank'}
                       download>
                        <Button primary
                                icon={<FontAwesomeIcon style={{fontSize: '1.4rem'}}
                                                       icon={faCloudDownloadAlt}/>}>&nbsp; Download design
                            template</Button>
                    </a>
                }
                {
                    productMeta.template_meta && !productMeta.template_meta.template_url && (
                        <Tooltip content={'This product does not have a design template'}>
                            <Button disabled primary
                                    icon={<FontAwesomeIcon style={{fontSize: '1.4rem'}}
                                                           icon={faCloudDownloadAlt}/>}>&nbsp; Download design
                                template</Button>
                        </Tooltip>
                    )
                }
            </div>
            <hr className="w-100 my-4"/>
            {
                productMeta.design_note && !productMeta.design_note.isEmpty && (
                    <div className="w-100">
                        <div className="col-12">
                            {/*<div className="flex-center-vertical mb-4">*/}
                            {/*    <FontAwesomeIcon icon={faMagic} className={'heading-icon'}/> &nbsp;*/}
                            {/*    <Heading>Design note</Heading>*/}
                            {/*</div>*/}
                            <div className="mt-3 p20 py-0">
                                <SanitizeHTML html={productMeta.design_note} allowIframe={true}/>
                            </div>
                        </div>
                        <hr className="w-100 my-4"/>
                    </div>
                )
            }
            <div className="col-12">
                <div className="flex-center-vertical mb-4">
                    <FontAwesomeIcon icon={faListAlt} className={'heading-icon'}/> &nbsp;
                    <Heading>Product design instructions</Heading>
                </div>
                <div className="mt-3">
                    {
                        designProductInstructionSteps.map((step, index) => {
                            return (
                                <div key={index} className={'design-product-instruction flex-center-vertical'}>
                                    <div className={'step-number'}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <strong>{step.title}</strong>
                                        <p>{step.content}</p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <hr className="w-100 my-4"/>
            <div className="col-12">
                <div className="flex-center-vertical mb-4">
                    <FontAwesomeIcon icon={faPoll} className={'heading-icon'}/> &nbsp;
                    <Heading>Best result tips</Heading>
                </div>
                <div className="mt-3">
                    {
                        howToGetBestResult.map((tip, index) => {
                            return (
                                <div key={index} className={'best-resutl-tip flex-center-vertical'}>
                                    <div className={'step-number'}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p>{tip}</p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <hr className="w-100 my-4"/>
            <div className="col-12">
                <div className="flex-center-vertical mb-4">
                    <FontAwesomeIcon icon={faEnvelopeOpenText} className={'heading-icon'}/> &nbsp;
                    <Heading>Print, cut and sew disclaimer</Heading>
                </div>
                <div className="mt-3">
                    {
                        cutAndSewDisclaimer.map((item, index) => {
                            return (
                                <div key={index} className={'cut-and-sew-disclaimer flex-center-vertical'}>
                                    <div className={'step-number'}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p>{item}</p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default ProductDesignTemplate