import React from 'react'
import {Modal, Subheading, TextContainer} from '@shopify/polaris'
import {useDropzone} from 'react-dropzone'
import StyledDropzone from '../artwork-item/StyledDropzone'
import "./MultiSideUploadArtworkModal.scss"

const MULTISIDE_UPLOAD_GUIDE = "https://storage.googleapis.com/printholo/shared/multiside.png"


const MultiSideUploadArtworkModal = (props) => {

    const {visible, setVisible, onFileDrop} = props

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({accept: 'image/*', onDrop: onFileDrop, multiple: true,})

    return (
        <div>
            <Modal
                large
                size={'large'}
                title={'Select Artworks'}
                open={visible}
                onClose={() => setVisible(false)}
                // primaryAction={{
                //     content: 'Done',
                //     onAction: handleOk,
                // }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setVisible(false),
                    },
                ]}
            >
                <Modal.Section>
                    <TextContainer>
                        <div className='px-2'>
                            <div className="row">
                                <StyledDropzone {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                                    <input {...getInputProps()} />
                                    <div className={'dndzone-text text-center'}>Drag and drop your artwork here, or
                                        click to select artwork files
                                        <br/>
                                        Example: "AOPHoodie1.png", "AOPHoodie1_Back.png", "AOPHoodie1_Sleeve.png",
                                        "AOPHoodie1_Hood.png"
                                    </div>
                                </StyledDropzone>
                            </div>
                            <div className="row mx-0 mt-3">
                                <Subheading>Sample:</Subheading>
                            </div>
                            <div className="row mx-0 justify-content-center">
                                <img src={MULTISIDE_UPLOAD_GUIDE} alt="" className={"w-100"}/>
                            </div>
                        </div>
                    </TextContainer>
                </Modal.Section>

            </Modal>
        </div>
    )
}

export default MultiSideUploadArtworkModal
