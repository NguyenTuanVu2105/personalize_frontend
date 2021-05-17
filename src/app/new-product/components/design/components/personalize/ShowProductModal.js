import React, {useContext} from "react"
import {Modal} from "antd"
import ChooseProduct from "../../../choose-product/ChooseProduct"
import NewProductDesignContext from "../../context/NewProductDesignContext";

const ShowProductModal = (props) => {
    const {visible, setVisible} = props
    const {
        setNewProduct
    } = useContext(NewProductDesignContext)

    const chooseProduct = async (product_id) => {
        setNewProduct(product_id)
        setVisible(false)
    }
    return (
        <Modal
            title={"Choose Product"}
            visible={visible}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            okText={"Done"}
            cancelText={"Cancel"}
            width={1200}
            bodyStyle={{height: '650px'}}
            style={{ top: 20 }}
        >
                <ChooseProduct disibleChangeStep={true} setNewProduct={chooseProduct}></ChooseProduct>
        </Modal>
    )
}

export default ShowProductModal