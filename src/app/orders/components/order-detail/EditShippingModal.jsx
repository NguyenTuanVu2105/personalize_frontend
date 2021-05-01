import React, {useEffect, useState} from 'react'
import {notification} from 'antd'
import './EditShippingModal.scss'
import {faEdit} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {editShippingAddress} from './../../../../services/api/orders'
import _ from 'lodash'
import {FormLayout, Modal, Select, TextField} from "@shopify/polaris"
import {retrieveShippingCountries} from "../../../../services/api/newOrder"


const EditShippingModal = ({id, address, visible, refetch, cityEditable}) => {
    const [modalState, setModalState] = useState({
        visible: false,
        confirmLoading: false
    })
    const [newAddress, setNewAddress] = useState(address)
    const [shippingAddressErrors, setShippingAddressErrors] = useState({})
    const [countryList, setCountryList] = useState([])
    const [countryOptions, setCountryOptions] = useState([])
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [shippingStateOptions, setShippingStateOptions] = useState([])
    let NOT_REQUIRE_FIELD = ['address2', 'company', 'phone']

    useEffect(() => {
        if (addressIsValid() && addressChanged()) {
            setModalState({...modalState, disabled: false})
        } else {
            setModalState({...modalState, disabled: true})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newAddress])

    useEffect(() => {
        setNewAddress(address)
        setSelectedCountry(address.country)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address])

    useEffect(() => {
        getShippingCountries().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    const addressChanged = () => {
        let changed = false
        let changedAttr = {}

        Object.keys(newAddress).forEach((key) => {
            if (address[key] !== newAddress[key]) {
                if (address[key] === null || address[key] === undefined) {
                    if (newAddress[key] !== "") {
                        changed = true
                        changedAttr[key] = newAddress[key]
                    }
                } else {
                    changed = true
                    changedAttr[key] = newAddress[key]
                }
            }
        })

        // if (changed) {
        //     setChangedAddressAttr(changedAttr)
        // }
        // else {
        //     setChangedAddressAttr({})
        // }
        // console.log(changedAttr);


        return changed
    }

    const handleFirstNameChange = (newValue) => onInputChange("first_name", newValue)

    const handleLastNameChange = (newValue) => onInputChange("last_name", newValue)

    const handlePhoneChange = (newValue) => onInputChange("phone", newValue)

    const handleAddress1Change = (newValue) => onInputChange("address1", newValue)

    const handleAddress2Change = (newValue) => onInputChange("address2", newValue)

    const addressIsValid = () => {
        // const phoneRegex = /(^\+[0-9]+$|^[0-9]*$)/
        // const zipRegex = /^\d{5}(?:[-\s]\d{4})?$/

        const _shippingAddressErrors = shippingAddressErrors
        shippingStateOptions.length === 0 && NOT_REQUIRE_FIELD.push("province")
        shippingStateOptions.length > 0 && _.remove(NOT_REQUIRE_FIELD, e => e === "province")
        Object.keys(newAddress).forEach(key => {
            if (NOT_REQUIRE_FIELD.includes(key)) {
                _shippingAddressErrors[key] = ""
            } else {
                const validField = !!newAddress[key]
                if (!validField) {
                    _shippingAddressErrors[key] = "Please correct this field!"
                } else {
                    _shippingAddressErrors[key] = ""
                }
            }
        })

        // let phoneIsValid = !newAddress.phone || newAddress.phone.match(phoneRegex)
        // if (!phoneIsValid) _shippingAddressErrors['phone'] = 'Phone is not valid'

        // let zipIsValid = !newAddress.zip || newAddress.zip.match(zipRegex)
        // if (!zipIsValid) _shippingAddressErrors['zip'] = 'Zip is not valid'

        setShippingAddressErrors({...shippingAddressErrors, ..._shippingAddressErrors})

        let result = false
        _.forEach(_shippingAddressErrors, wrong => {
            result = result || wrong
        })
        return !result
    }

    const onInputChange = (key, newValue) => {
        setNewAddress({...newAddress, [key]: newValue})
    }

    const showModal = () => {
        setModalState({...modalState, visible: true, disabled: true})
    }

    const cancelModel = () => {
        setModalState({...modalState, visible: false, confirmLoading: false,})
        setNewAddress(address)
    }

    // const showConfirmation = () => {
    //     Modal.confirm({
    //         title: 'Are you sure?',
    //         content: 'Please review your information carefully',
    //         centered: true,
    //         okText: 'Yes',
    //         // okType: 'danger',
    //         cancelText: 'No',
    //         onOk: submitChanges,
    //     })
    // }

    const submitChanges = async () => {
        setModalState({...modalState, confirmLoading: true,})

        editShippingAddress(id, newAddress)
            .then((result) => {
                if (result.data && result.data.success) {
                    setModalState({...modalState, visible: false, confirmLoading: false})
                    refetch()
                } else {
                    throw (new Error("error"))
                }
            })
            .catch((error) => {
                notification.error({
                    message: "Something went wrong, please try again",
                    duration: 2
                })
                setModalState({...modalState, confirmLoading: false,})
            })
    }

    const renderRequiredLabel = (title) => {
        return (
            <span>{title} <span style={{color: "red"}}>*</span></span>
        )
    }

    const onClickSubmit = () => {
        let _shippingAddressErrors = shippingAddressErrors
        shippingStateOptions.length === 0 && NOT_REQUIRE_FIELD.push("province")
        shippingStateOptions.length > 0 && _.remove(NOT_REQUIRE_FIELD, e => e === "province")
        const valid = Object.keys(newAddress).every(key => {
            if (NOT_REQUIRE_FIELD.includes(key)) {
                _shippingAddressErrors[key] = ""
                return true
            } else {
                const validField = !!newAddress[key]
                if (!validField) {
                    _shippingAddressErrors[key] = "Please correct this field!"
                } else {
                    _shippingAddressErrors[key] = ""
                }
                return validField
            }
        })
        setShippingAddressErrors({...shippingAddressErrors, ..._shippingAddressErrors})
        return valid ? submitChanges() : null
    }

    const getShippingCountries = async () => {
        const {success, data} = await retrieveShippingCountries()
        if (!success) notification.error({
            message: "Error",
            description: "An error occurred, please try again or contact our support team"
        })

        else {
            let shippingCountries = data.map(country => ({
                label: country.name,
                value: country.name
            }))
            shippingCountries = _.sortBy(_.uniqBy(shippingCountries, 'value'), 'value')
            const startOption = [
                {
                    label: "--- Select a country ---",
                    value: ""
                }
            ]
            setCountryList(data)
            setCountryOptions([...startOption, ...shippingCountries])
            const selectedCountry = data.find(country => country.name === address.country)
            updateRegionChoices(selectedCountry)
        }
    }

    const handleCountryChange = (newValue) => {
        setSelectedCountry(newValue)
        setShippingAddressErrors({...shippingAddressErrors, country: ""})
        const selectedCountry = countryList.find(country => country.name === newValue)
        const selectedCountryCode = selectedCountry ? selectedCountry.code : ""
        setNewAddress({...newAddress, country: newValue, "country_code": selectedCountryCode, province: "", zip: ""})
        updateRegionChoices(selectedCountry)
    }

    const updateRegionChoices = (country) => {
        const shippingStateOptions = country ? country.states.map(state => ({
            label: state.name,
            value: state.name
        })) : []
        const startOption = [
            {
                label: "--- Select a region/state ---",
                value: ""
            }
        ]
        if (shippingStateOptions.length > 0) {
            setShippingStateOptions([...startOption, ...shippingStateOptions])
            // setNotRequiredFields(_.remove(notRequiredFields, e => e === "province"))
            // console.log("notRequiredFields", notRequiredFields)
            // console.log("_.remove(notRequiredFields, e => e === \"province\")", _.remove(notRequiredFields, "province"))
        } else {
            setShippingStateOptions([])
            // setNotRequiredFields([...notRequiredFields, "province"])
        }
    }

    return (
        visible && (
            <div className="edit-shipping-wrapper">
                <span onClick={showModal} className={"link-ui p-3"}>
                    <FontAwesomeIcon icon={faEdit}/>&nbsp;Edit
                </span>
                <Modal
                    open={modalState.visible}
                    onClose={cancelModel}
                    title="Edit shipping address"
                    primaryAction={{
                        content: 'Submit changes',
                        onAction: onClickSubmit,
                        disabled: modalState.disabled,
                        loading: modalState.confirmLoading
                    }}
                    // large
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: cancelModel,
                        },
                    ]}
                >
                    <div className={'edit-shipping-modal'}>
                        <Modal.Section>
                            <FormLayout>
                                <FormLayout.Group>
                                    <TextField label={renderRequiredLabel("First name")}
                                               value={newAddress.first_name}
                                               onChange={handleFirstNameChange}
                                               clearButton
                                               onClearButtonClick={() => onInputChange("first_name", "")}
                                               placeholder={"Enter your first name"}
                                               error={shippingAddressErrors.first_name}
                                               maxLength={100}
                                    >

                                    </TextField>
                                    <TextField label={renderRequiredLabel("Last name")}
                                               value={newAddress.last_name}
                                               onChange={handleLastNameChange}
                                               clearButton
                                               onClearButtonClick={() => onInputChange("last_name", "")}
                                               placeholder={"Enter your last name"}
                                               error={shippingAddressErrors.last_name}
                                               maxLength={100}
                                    >

                                    </TextField>
                                </FormLayout.Group>
                                <FormLayout.Group>
                                    <TextField label={("Phone number")}
                                               value={newAddress.phone}
                                               onChange={handlePhoneChange}
                                               clearButton
                                               onClearButtonClick={() => onInputChange("phone", "")}
                                               placeholder={"Enter your phone number"}
                                               error={shippingAddressErrors.phone}
                                               maxLength={20}
                                    >
                                    </TextField>
                                </FormLayout.Group>
                                <FormLayout.Group>
                                    <TextField label={renderRequiredLabel("Address 1")}
                                               value={newAddress.address1}
                                               onChange={handleAddress1Change}
                                               clearButton
                                               onClearButtonClick={() => onInputChange("address1", "")}
                                               placeholder={"Enter your first address"}
                                               error={shippingAddressErrors.address1}
                                               showCharacterCount
                                    >

                                    </TextField>
                                </FormLayout.Group>
                                <FormLayout.Group>
                                    <TextField label={"Address 2"}
                                               value={newAddress.address2}
                                               onChange={handleAddress2Change}
                                               clearButton
                                               onClearButtonClick={() => onInputChange("address2", "")}
                                               placeholder={"Enter your second address"}
                                               error={shippingAddressErrors.address2}
                                               showCharacterCount
                                    >
                                    </TextField>
                                </FormLayout.Group>
                                <FormLayout.Group>
                                    <TextField label={renderRequiredLabel("City")}
                                               value={newAddress.city}
                                               onChange={(value) => {
                                                   onInputChange("city", value)
                                               }}
                                               disabled={!cityEditable}
                                               placeholder={"Enter your city"}
                                               maxLength={50}
                                    >
                                    </TextField>
                                    <Select
                                        label={renderRequiredLabel("Country")}
                                        options={countryOptions}
                                        onChange={handleCountryChange}
                                        value={selectedCountry}
                                        disabled={!cityEditable}
                                        error={shippingAddressErrors.country}
                                    />
                                </FormLayout.Group>
                                <FormLayout.Group condensed>
                                    {
                                        shippingStateOptions.length > 0 && <Select
                                            label={renderRequiredLabel("Region/State/Province")}
                                            options={shippingStateOptions}
                                            onChange={(value) => {
                                                onInputChange("province", value)
                                            }}
                                            value={newAddress.province}
                                            error={shippingAddressErrors.region}
                                        />
                                    }
                                    {
                                        shippingStateOptions.length === 0 &&
                                        <TextField label={"Region/State/Province"}
                                                   value={newAddress.province}
                                                   onChange={(value) => {
                                                       onInputChange("province", value)
                                                   }}
                                                   disabled={!cityEditable}
                                                   placeholder={"Enter your province"}
                                                   maxLength={50}
                                        >
                                        </TextField>

                                    }
                                    <TextField label={renderRequiredLabel("ZIP code", "zip")}
                                               value={newAddress.zip}
                                               onChange={(value) => {
                                                   onInputChange("zip", value)
                                               }}
                                               disabled={!cityEditable}
                                               placeholder={"Enter your ZIP code"}
                                               maxLength={10}
                                    >
                                    </TextField>
                                </FormLayout.Group>
                            </FormLayout>
                        </Modal.Section>
                    </div>
                </Modal>
            </div>
        )
    )
}

export default EditShippingModal
