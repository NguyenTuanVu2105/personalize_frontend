import React from 'react'
import {mount} from 'enzyme'
import BankLogo from './'

describe('BankLogo', () => {
    it('should not mount without bank, model and type', () => {
        const wrapper = mount(
            <BankLogo/>
        )

        expect(wrapper.html()).toBeNull()
    })

    it('should not mount without type', () => {
        const wrapper = mount(
            <BankLogo
                bank="bradesco"
                model="normal"
            />
        )

        expect(wrapper.html()).toBeNull()
    })


    it('should mount', () => {
        const wrapper = mount(
            <BankLogo
                bank="bradesco"
                model="normal"
                type="black"
            />
        )

        expect(wrapper.find('img')).toHaveLength(1)
    })
})
