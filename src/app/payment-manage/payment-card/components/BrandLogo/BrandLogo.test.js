import React from 'react'
import {mount} from 'enzyme'
import BrandLogo from './'

describe('BrandLogo', () => {
    it('should not mount without brand', () => {
        const wrapper = mount(
            <BrandLogo/>
        )

        expect(wrapper.html()).toBeNull()
    })

    it('should not mount with brand nonexistent', () => {
        const wrapper = mount(
            <BrandLogo
                brand="brand"
            />
        )

        expect(wrapper.html()).toBeNull()
    })


    it('should mount', () => {
        const wrapper = mount(
            <BrandLogo
                brand="mastercard"
            />
        )

        expect(wrapper.find('img')).toHaveLength(1)
    })
})
