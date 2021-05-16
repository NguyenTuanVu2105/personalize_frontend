import {Menu, Skeleton} from 'antd'
import React from 'react'
import ChangeStepContainer from '../common/ChangeStepContainer'
import Zenscroll from "zenscroll"

const CategoryListSideBar = (props) => {
    const {onClick, categories, selectedCategoryId} = props
    // console.log("selectedCategoryIds",selectedCategoryId)
    const onClickItem = (item) => {
        const element = document.getElementById("topList")
        if (element) {
            const container = document.getElementById("listProduct")
            const myScroller = Zenscroll.createScroller(container)
            myScroller.center(element, 0)
        }
        onClick(item.key)
    }
    return (
        <div className={"category-list-sidebar"}>
            {/*<div className="ph1em">*/}
            {/*    <ChangeStepContainer/>*/}
            {/*</div>*/}
            {categories && selectedCategoryId ?
            <Menu
                onClick={onClickItem}
                style={{width: '100%'}}
                defaultSelectedKeys={[''+ selectedCategoryId]}
                mode="inline"
                className="no-border-force list-category"
            >
                {
                    categories.map(category => <Menu.Item key={''+category.id}>{category.title}</Menu.Item>)
                }

            </Menu>
            :
            <div style={{height: '350px', padding: '10px', backgroundColor: 'white'}} >
                <Skeleton active/>
            </div>}
        </div>

    )
}

export default CategoryListSideBar
