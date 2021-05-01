import React from 'react'
import {mount} from 'enzyme'
import ModelLogo from './'

describe('ModelLogo', () => {
    it('should not mount without bank, model and type', () => {
        const wrapper = mount(
            <ModelLogo/>
        )

        expect(wrapper.html()).toBeNull()
    })

    it('should not mount without type', () => {
        const wrapper = mount(
            <ModelLogo
                bank="bradesco"
                model="normal"
            />
        )

        expect(wrapper.html()).toBeNull()
    })


    it('should mount', () => {
        const wrapper = mount(
            <ModelLogo
                bank="bradesco"
                model="prime"
                type="black"
            />
        )

        expect(wrapper.find('img')).toHaveLength(1)
    })
})
