import React from "react";

type Props = {
    clickCallback: (category: string, parentCategory: string) => void;
    subcategory: string;
    parentCategory: string;
};

function SubCategoryListItem(props: Props) {
    const {subcategory, parentCategory, clickCallback} = props;
    return (
        <li
            key={subcategory}
            className="subcat-list__item"
            onClick={() => clickCallback(subcategory, parentCategory)}
        >
            <button className="li-button" value={subcategory} type="button">
                <span className="li-button__minus">-</span>
                {subcategory}
            </button>
        </li>
    )
}

export default SubCategoryListItem;
