import React from 'react'
import {mount} from 'enzyme'
import PaymentCard from './'

describe('PaymentCard', () => {
    it('should mount', () => {
        const wrapper = mount(
            <PaymentCard/>
        )

        expect(wrapper.find('.card').at(0)).toHaveLength(1)
    })

    it('should mount with bank', () => {
        const wrapper = mount(
            <PaymentCard
                bank="nubank"
            />
        )

        expect(wrapper.find('.card').at(0)).toHaveLength(1)
    })

    it('should mount with brand', () => {
        const wrapper = mount(
            <PaymentCard
                brand="mastercard"
            />
        )

        expect(wrapper.find('.brandLogo').at(0)).toHaveLength(1)
    })

    it('should mount with number', () => {
        const wrapper = mount(
            <PaymentCard
                number="4111111111111111"
            />
        )

        expect(wrapper.find('.number').at(0).text()).toContain('4111 1111 1111 1111')
    })

    it('should mount with cvv', () => {
        const wrapper = mount(
            <PaymentCard
                cvv="123"
            />
        )

        expect(wrapper.find('.cvv').at(0).text()).toContain('123')
    })

    it('should mount with holderName', () => {
        const wrapper = mount(
            <PaymentCard
                holderName="Fulano de tal"
            />
        )

        expect(wrapper.find('.holderName').at(0).text()).toContain('Fulano de tal')
    })

    it('should mount with expiration', () => {
        const wrapper = mount(
            <PaymentCard
                expiration="12/19"
            />
        )

        expect(wrapper.find('.expiration').at(0).text()).toContain('12/19')
    })

    it('should mount with flipped', () => {
        const wrapper = mount(
            <PaymentCard
                flipped
            />
        )

        expect(wrapper.find('.flipped').at(0)).toHaveLength(1)
    })

    it('should mount full component', () => {
        const wrapper = mount(
            <PaymentCard
                bank="default"
                brand="mastercard"
                number="4111111111111111"
                cvv="123"
                holderName="Fulano de tal"
                expiration="12/19"
                flipped
            />
        )

        expect(wrapper.find('.card').at(0)).toHaveLength(1)
        expect(wrapper.find('.brandLogo').at(0)).toHaveLength(1)
        expect(wrapper.find('.number').at(0).text()).toContain('4111 1111 1111 1111')
        expect(wrapper.find('.cvv').at(0).text()).toContain('123')
        expect(wrapper.find('.holderName').at(0).text()).toContain('Fulano de tal')
        expect(wrapper.find('.expiration').at(0).text()).toContain('12/19')
        expect(wrapper.find('.flipped').at(0)).toHaveLength(1)
    })
})
