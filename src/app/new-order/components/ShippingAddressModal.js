import React, {useCallback, useEffect, useState} from 'react'
import {Modal, Select, TextField} from "@shopify/polaris"
import {
    Checkbox, Icon,
    notification
    , Select as AntdSelect, Spin
} from "antd"
import {
    createSampleShippingAddress, deleteSampleShippingAddress,
    retrieveSampleShippingAddress,
    retrieveShippingCountries
} from "../../../services/api/newOrder"
import {getUserProfile} from "../../../services/api/userProfile"
import './ShippingAddressModal.scss'
import _ from "lodash"

const SHIPPING_ADDRESS_DEFAULT = {
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    country: '',
    countryCode: '',
    region: '',
    zipCode: '',
}

// const SHIPPING_ADDRESS_ERROR_DEFAULT = {
//     firstName: '',
//     lastName: '',
//     company: '',
//     phone: '',
//     address: '',
//     apartment: '',
//     city: '',
//     country: '',
//     region: '',
//     zipCode: '',
// }

const ShippingAddressModal = ({shippingAddress, onSave}) => {
    const defaultSampleAddress = {...SHIPPING_ADDRESS_DEFAULT, id: '-1', fullName: 'Not selected'};

    const [modalVisible, setModalVisible] = useState(false)
    const [shippingAddresses, setShippingAddresses] = useState({})
    const [shippingAddressErrors, setShippingAddressErrors] = useState({})
    const [shippingCountries, setShippingCountries] = useState([])
    const [shippingCountryOptions, setShippingCountryOptions] = useState([])
    const [shippingStateOptions, setShippingStateOptions] = useState([])
    const [saveButtonLoading, setSaveButtonLoading] = useState(false)
    const [sampleAddressOptions, setSampleAddressOptions] = useState([])
    const [searchSampleAddressOptions, setSearchSampleAddressOptions] = useState([])
    const [selectedSampleAddress, setSelectedSampleAddress] = useState(defaultSampleAddress)
    const [rememberAddress, setRememberAddress] = useState(false)
    const [removingAddress, setRemovingAddress] = useState(false)
    const [, updateState] = useState()

    let NOT_REQUIRE_FIELD = ['company', 'apartment']

    useEffect(() => {
        if (shippingAddress) {
            setShippingAddresses(shippingAddress)
        } else {
            setShippingAddresses(SHIPPING_ADDRESS_DEFAULT)
        }
        getShippingCountries()
        if (_.isEmpty(shippingAddresses)) {
            fetchProfileToShipping()
        }
        getSampleAddress()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shippingAddress])


    const toggleModalVisible = () => setModalVisible(!modalVisible)
    const forceUpdate = useCallback(() => updateState({}), [])
    const fetchProfileToShipping = async () => {
        const {success, data} = await getUserProfile()
        if (success && data.success) {
            const name = data.profile.name
            const firstName = name.substr(0, name.indexOf(' '));
            const lastName = name.substr(name.indexOf(' ') + 1);
            setShippingAddresses({
                firstName: firstName,
                lastName: lastName,
                company: '',
                phone: data.profile.phone_number,
                address: data.profile.address,
                apartment: '',
                city: '',
                country: '',
                countryCode: '',
                region: '',
                zipCode: '',
            })
        }
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
            setShippingCountries(data)
            setShippingCountryOptions([...startOption, ...shippingCountries])
        }
    }

    const getSampleAddress = async () => {
        const {success, data} = await retrieveSampleShippingAddress()
        if (!success) notification.error({
            message: "Error",
            description: "An error occurred, please try again or contact our support team"
        })
        else {
            const sampleAddress = data.map(address => ({
                id: address.id.toString(),
                firstName: address.first_name,
                lastName: address.last_name,
                fullName: address.first_name + ' ' + address.last_name,
                company: address.company,
                phone: address.phone,
                address: address.address,
                apartment: address.apartment,
                city: address.city,
                country: address.country,
                countryCode: address.country_code,
                region: address.province,
                zipCode: address.zip,
            }))
            sampleAddress.unshift(defaultSampleAddress)
            setSampleAddressOptions(sampleAddress)
            setSearchSampleAddressOptions(sampleAddress)
        }
    }

    const onValidFormSubmit = async (shippingAddresses) => {
        setSaveButtonLoading(false)
        onSave(shippingAddresses)
        let data = {
            first_name: shippingAddresses.firstName,
            last_name: shippingAddresses.lastName,
            phone: shippingAddresses.phone,
            address: shippingAddresses.address,
            apartment: shippingAddresses.apartment,
            city: shippingAddresses.city,
            province: shippingAddresses.region,
            country: shippingAddresses.country,
            country_code: shippingAddresses.countryCode,
            company: shippingAddresses.company,
            zip: shippingAddresses.zipCode
        }
        if (rememberAddress) {
            await createSampleShippingAddress(data)
        }
        getSampleAddress()
        setModalVisible(false)
    }

    const onAddClick = () => {
        setSaveButtonLoading(true)
        let _shippingAddressErrors = shippingAddressErrors
        shippingStateOptions.length === 0 && NOT_REQUIRE_FIELD.push("region")
        const valid = Object.keys(shippingAddresses).every(key => {
            if (NOT_REQUIRE_FIELD.includes(key)) {
                _shippingAddressErrors[key] = ""
                return true
            } else {
                const validField = !!shippingAddresses[key]
                if (!validField) {
                    _shippingAddressErrors[key] = "Please correct this field!"
                } else {
                    _shippingAddressErrors[key] = ""
                }
                return validField
            }
        })
        setShippingAddressErrors(_shippingAddressErrors)
        forceUpdate()
        return valid ? onValidFormSubmit(shippingAddresses) : setSaveButtonLoading(false)
    }

    const handleFirstNameChange = (newValue) => {
        setShippingAddresses({...shippingAddresses, firstName: newValue})
        setShippingAddressErrors({...shippingAddressErrors, firstName: ""})
    }
    const handleLastNameChange = (newValue) => {
        setShippingAddresses({...shippingAddresses, lastName: newValue})
        setShippingAddressErrors({...shippingAddressErrors, lastName: ""})

    }
    const handleCompanyChange = (newValue) => {
        setShippingAddresses({...shippingAddresses, company: newValue})
        setShippingAddressErrors({...shippingAddressErrors, company: ""})
    }
    const handlePhoneChange = (newValue) => {
        setShippingAddresses({...shippingAddresses, phone: newValue})
        setShippingAddressErrors({...shippingAddressErrors, phone: ""})
    }
    const handleAddressChange = (newValue) => {
        setShippingAddresses({...shippingAddresses, address: newValue})
        setShippingAddressErrors({...shippingAddressErrors, address: ""})
    }
    const handleApartmentChange = (newValue) => {
        setShippingAddresses({...shippingAddresses, apartment: newValue})
        setShippingAddressErrors({...shippingAddressErrors, apartment: ""})
    }
    const handleCityChange = (newValue) => {
        setShippingAddresses({...shippingAddresses, city: newValue})
        setShippingAddressErrors({...shippingAddressErrors, city: ""})
    }
    const handleCountryChange = (newValue) => {
        setShippingAddressErrors({...shippingAddressErrors, country: ""})
        const selectedCountry = shippingCountries.find(country => country.name === newValue)
        const selectedCountryCode = selectedCountry ? selectedCountry.code : ""
        const selectedCountryZone = selectedCountry ? selectedCountry.zone.id : ""
        setShippingAddresses({
            ...shippingAddresses,
            country: newValue,
            region: "",
            countryCode: selectedCountryCode,
            countryZone: selectedCountryZone
        })
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
        return shippingStateOptions.length > 0 ? setShippingStateOptions([...startOption, ...shippingStateOptions]) : setShippingStateOptions([])
    }

    const handleRegionChange = (newValue) => setShippingAddresses({...shippingAddresses, region: newValue})
    const handleZipCodeChange = (newValue) => setShippingAddresses({...shippingAddresses, zipCode: newValue})

    const renderLabel = (title) => {
        return (
            <span>{title} <span style={{color: "red"}}>*</span></span>
        )
    }

    function handleSelectSampleAddress(selectedAddressId) {
        let selectedAddress = sampleAddressOptions.filter(item => item.id === selectedAddressId)[0]
        setSelectedSampleAddress(selectedAddress)
        const selectedCountry = shippingCountries.find(country => country.name === selectedAddress.country)
        const selectedCountryCode = selectedCountry ? selectedCountry.code : ""
        const selectedCountryZone = selectedCountry ? selectedCountry.zone.id : ""
        setShippingAddresses({
            ...selectedAddress,
            countryCode: selectedCountryCode,
            countryZone: selectedCountryZone
        })
        updateRegionChoices(selectedCountry)
    }

    const onSearchSampleAddress = (value) => {
        const result = sampleAddressOptions.filter(address => {
            return address.fullName.toLowerCase().search(value.toLowerCase()) !== -1;
        })
        setSearchSampleAddressOptions(result)
    }

    const getAddressUIOption = (address) => {
        const fullAddress = address.apartment ?
            `${address.address}, ${address.apartment}, ${address.city}, ${address.country}` :
            `${address.address}, ${address.city}, ${address.country}`
        return <div>
            <div>{address.fullName}</div>
            <div>{address.phone}</div>
            <div>{fullAddress}</div>
        </div>
    }

    return (
        <div>
            <span className={'link-ui'} onClick={toggleModalVisible}>
                {shippingAddress === null ? "Add address" : "Edit Address"}
            </span>
            <Modal
                open={modalVisible}
                onClose={toggleModalVisible}
                title={shippingAddress === null ? `Add shipping address` : "Edit shipping address"}
                primaryAction={{
                    content: 'Save',
                    onAction: onAddClick,
                    loading: saveButtonLoading
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: toggleModalVisible,
                    },
                ]}
            >
                <Modal.Section>
                    <div className="row">
                        {sampleAddressOptions.length !== 0 &&
                        <div className="col-12" style={{paddingBottom: '10px'}}>
                            <div style={{paddingBottom: '10px'}}>Choose saved address</div>
                            {removingAddress ? <div style={{textAlign: "center"}}><Spin/></div> : <AntdSelect
                                className='col-12'
                                showSearch
                                bordered={true}
                                defaultValue={selectedSampleAddress.fullName}
                                onSelect={handleSelectSampleAddress}
                                onSearch={onSearchSampleAddress}
                                optionLabelProp="label"
                                filterOption={false}>
                                {searchSampleAddressOptions.map((address) => (
                                    <AntdSelect.Option
                                        className='sample-address-item'
                                        key={address.id}
                                        label={address.fullName}>
                                        {JSON.stringify(address) === JSON.stringify(defaultSampleAddress) ?
                                            <div>Not selected</div> :
                                            <div className={'flex-horizontal'}
                                                 style={{padding: '0.25em 0em', fontSize: '1.4rem'}}>
                                                <div className="flex-center-horizontal w-75">
                                                    {getAddressUIOption(address)}
                                                </div>
                                                <div className="sp-delete-button-container">
                                                    <Icon type='delete'
                                                          className='sp-delete-button'
                                                          onClick={(e) => {
                                                              e.stopPropagation()
                                                              if (window.confirm(`Delete address ${address.fullName}?`)) {
                                                                  setRemovingAddress(true)
                                                                  deleteSampleShippingAddress(address.id).then(getSampleAddress).then(() => setRemovingAddress(false))
                                                              }
                                                          }}/>
                                                </div>
                                            </div>
                                        }
                                    </AntdSelect.Option>
                                ))}
                            </AntdSelect>}
                        </div>
                        }
                        <div className="col-6">
                            <TextField label={renderLabel("First name")} value={shippingAddresses.firstName}
                                       onChange={handleFirstNameChange} error={shippingAddressErrors.firstName}/>
                        </div>
                        <div className="col-6">
                            <TextField label={renderLabel("Last name")} value={shippingAddresses.lastName}
                                       onChange={handleLastNameChange} error={shippingAddressErrors.lastName}/>
                        </div>
                        <div className="col-6 mt-3">
                            <TextField label="Company" value={shippingAddresses.company}
                                       onChange={handleCompanyChange} error={shippingAddressErrors.company}/>
                        </div>
                        <div className="col-6 mt-3">
                            <TextField label={renderLabel("Phone number")} value={shippingAddresses.phone}
                                       onChange={handlePhoneChange} error={shippingAddressErrors.phone}/>
                        </div>
                        <div className="col-6 mt-3">
                            <TextField label={renderLabel("Address")} value={shippingAddresses.address}
                                       onChange={handleAddressChange} error={shippingAddressErrors.address}/>
                        </div>
                        <div className="col-6 mt-3">
                            <TextField label="Apartment, suite, etc." value={shippingAddresses.apartment}
                                       onChange={handleApartmentChange} error={shippingAddressErrors.apartment}/>
                        </div>
                        <div className="col-6 mt-3">
                            <TextField label={renderLabel("City")} value={shippingAddresses.city}
                                       onChange={handleCityChange}
                                       error={shippingAddressErrors.city}/>
                        </div>
                        <div className="col-6 mt-3">
                            <Select
                                label={renderLabel("Country")}
                                options={shippingCountryOptions}
                                onChange={handleCountryChange}
                                value={shippingAddresses.country}
                                error={shippingAddressErrors.country}
                            />
                        </div>
                        <div className="col-6 mt-3">
                            {
                                shippingStateOptions.length > 0 && <Select
                                    label={renderLabel("Region/State/Province")}
                                    options={shippingStateOptions}
                                    onChange={handleRegionChange}
                                    value={shippingAddresses.region}
                                    error={shippingAddressErrors.region}
                                />
                            }
                            {
                                shippingStateOptions.length === 0 &&
                                <TextField label={"Region/State/Province"} value={shippingAddresses.region}
                                           onChange={handleRegionChange} error={shippingAddressErrors.region}/>
                            }
                        </div>
                        <div className="col-6 mt-3">
                            <TextField label={renderLabel("ZIP/Postal code")} value={shippingAddresses.zipCode}
                                       onChange={handleZipCodeChange} error={shippingAddressErrors.zipCode}/>
                        </div>
                        <div className="col-6 mt-3">
                            <Checkbox checked={rememberAddress}
                                      onChange={e => setRememberAddress(e.target.checked)}>
                                Remember address
                            </Checkbox>
                        </div>
                    </div>
                </Modal.Section>
            </Modal>

        </div>
    )
}

export default ShippingAddressModal
